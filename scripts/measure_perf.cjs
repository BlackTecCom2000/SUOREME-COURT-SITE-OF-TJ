const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('Navigating to http://localhost:5173...');
  const startTime = Date.now();
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
  const loadTime = Date.now() - startTime;
  
  console.log(`Page loaded in ${loadTime} ms`);

  // Evaluate performance timing API
  const performanceTiming = await page.evaluate(() => {
    const timing = window.performance.timing;
    return {
      ttfb: timing.responseStart - timing.navigationStart,
      domInteractive: timing.domInteractive - timing.navigationStart,
      domComplete: timing.domComplete - timing.navigationStart,
      loadEvent: timing.loadEventEnd - timing.navigationStart
    };
  });

  // Evaluate Paint Timing API
  const paintMetrics = await page.evaluate(() => {
    return new Promise((resolve) => {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const metrics = {};
        for (const entry of entries) {
          metrics[entry.name] = entry.startTime;
        }
        resolve(metrics);
      });
      observer.observe({ type: 'paint', buffered: true });
      
      // Fallback if observer doesn't trigger quickly
      setTimeout(() => {
        const entries = performance.getEntriesByType('paint');
        const metrics = {};
        for (const entry of entries) {
          metrics[entry.name] = entry.startTime;
        }
        resolve(metrics);
      }, 1000);
    });
  });

  console.log('\n--- Navigation Timing (ms) ---');
  console.log(`TTFB (Time to First Byte): ${performanceTiming.ttfb}`);
  console.log(`DOM Interactive: ${performanceTiming.domInteractive}`);
  console.log(`DOM Complete: ${performanceTiming.domComplete}`);
  console.log(`Load Event: ${performanceTiming.loadEvent}`);

  console.log('\n--- Paint Timing (ms) ---');
  console.log(`First Paint: ${paintMetrics['first-paint'] || 'N/A'}`);
  console.log(`First Contentful Paint (FCP): ${paintMetrics['first-contentful-paint'] || 'N/A'}`);

  await browser.close();
})();
