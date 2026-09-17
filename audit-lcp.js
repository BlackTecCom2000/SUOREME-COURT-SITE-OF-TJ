import { chromium, devices } from 'playwright';

async function runLCPAudit() {
  console.log('Starting LCP Audit...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    ...devices['Pixel 5'],
  });
  
  const page = await context.newPage();
  
  // Track network requests
  const requests = [];
  page.on('request', req => requests.push({ url: req.url(), resourceType: req.resourceType(), timing: req.timing() }));

  console.log('Navigating to http://localhost:8787...');
  await page.goto('http://localhost:8787', { waitUntil: 'networkidle', timeout: 30000 });

  // Get LCP Element
  const lcpData = await page.evaluate(() => {
    return new Promise((resolve) => {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        resolve({
          startTime: lastEntry.startTime,
          elementHTML: lastEntry.element ? lastEntry.element.outerHTML : 'No element',
          url: lastEntry.url || null
        });
      });
      observer.observe({ type: 'largest-contentful-paint', buffered: true });
      setTimeout(() => resolve(null), 2000);
    });
  });

  if (lcpData) {
    console.log(`\n--- LCP Metrics ---`);
    console.log(`Time: ${lcpData.startTime} ms`);
    console.log(`Element: ${lcpData.elementHTML.substring(0, 300)}...`);
    if (lcpData.url) console.log(`Image URL: ${lcpData.url}`);
    
    // Find blocking scripts before LCP
    const blockingScripts = requests.filter(r => r.resourceType === 'script' && r.timing && r.timing.startTime < lcpData.startTime);
    console.log(`\n--- Scripts loaded before LCP: ${blockingScripts.length} ---`);
    blockingScripts.forEach(s => console.log(s.url));
  } else {
    console.log('No LCP data found.');
  }

  await browser.close();
}

runLCPAudit().catch(console.error);
