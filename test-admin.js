const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  
  // Enable console logging
  page.on('console', (msg) => {
    console.log('PAGE LOG:', msg.text());
  });
  
  // Enable error logging
  page.on('pageerror', (error) => {
    console.error('PAGE ERROR:', error.message);
  });
  
  // Go to admin interface
  await page.goto('http://localhost:3001');
  
  // Wait for the page to load
  await page.waitForTimeout(3000);
  
  // Check if React app loaded
  const hasReactRoot = await page.$('#root');
  console.log('React root element found:', !!hasReactRoot);
  
  // Check page title
  const title = await page.title();
  console.log('Page title:', title);
  
  // Check for navigation elements
  const navLinks = await page.$$eval('a', links => links.map(a => a.textContent));
  console.log('Navigation links found:', navLinks);
  
  // Check for API calls
  const apiCalls = [];
  page.on('request', request => {
    if (request.url().includes('/api/')) {
      apiCalls.push(request.url());
    }
  });
  
  // Wait a bit more to catch API calls
  await page.waitForTimeout(2000);
  console.log('API calls made:', apiCalls);
  
  await browser.close();
})();