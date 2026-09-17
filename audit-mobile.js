import { chromium, devices } from 'playwright';
import fs from 'fs';

async function runAudit() {
  console.log('Starting Mobile Performance Audit...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    ...devices['Pixel 5'], // Emulate a typical mobile device
  });
  
  const page = await context.newPage();
  const client = await page.context().newCDPSession(page);
  
  await client.send('Performance.enable');

  console.log('Navigating to http://localhost:8787...');
  const startTime = Date.now();
  await page.goto('http://localhost:8787', { waitUntil: 'networkidle', timeout: 30000 });
  const loadTime = Date.now() - startTime;
  console.log(`Page Load Time (networkidle): ${loadTime}ms`);

  // Wait a bit to let visual effects and 3D models initialize
  await page.waitForTimeout(5000);

  const performanceMetrics = await client.send('Performance.getMetrics');
  
  console.log('--- CDP Performance Metrics ---');
  const interestingMetrics = ['JSHeapUsedSize', 'LayoutCount', 'RecalcStyleCount', 'ScriptDuration', 'TaskDuration'];
  performanceMetrics.metrics.forEach(m => {
      if (interestingMetrics.includes(m.name)) {
          console.log(`${m.name}: ${m.value}`);
      }
  });

  // Evaluate LCP using PerformanceObserver inside the page
  const lcp = await page.evaluate(() => {
    return new Promise((resolve) => {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        resolve(lastEntry ? lastEntry.startTime : null);
      });
      observer.observe({ type: 'largest-contentful-paint', buffered: true });
      // Resolve after 2 seconds if no LCP event fires
      setTimeout(() => resolve(null), 2000);
    });
  });
  console.log(`LCP (Largest Contentful Paint): ${lcp} ms`);

  // Count DOM nodes
  const domNodes = await page.evaluate(() => document.querySelectorAll('*').length);
  console.log(`Total DOM nodes: ${domNodes}`);

  // Test scroll performance / RequestAnimationFrame
  console.log('Testing scroll and rendering...');
  const frames = await page.evaluate(async () => {
      return new Promise(resolve => {
          let count = 0;
          let start = performance.now();
          function tick() {
              count++;
              if (performance.now() - start < 2000) {
                  requestAnimationFrame(tick);
              } else {
                  resolve(count);
              }
          }
          requestAnimationFrame(tick);
          // simulate scrolling
          window.scrollBy(0, 1000);
      });
  });
  const fps = frames / 2; // 2 seconds
  console.log(`Estimated FPS during scroll/idle: ${fps}`);

  await browser.close();
  console.log('Audit completed.');
}

runAudit().catch(console.error);
