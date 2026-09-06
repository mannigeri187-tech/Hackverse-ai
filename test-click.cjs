const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
  page.on('pageerror', error => console.log('BROWSER ERROR:', error.message));
  await page.goto('http://localhost:5173/dashboard');
  await new Promise(r => setTimeout(r, 2000));
  console.log('Clicking Resume Builder link...');
  try {
    await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a'));
      const resumeLink = links.find(l => l.href.includes('/resume-builder'));
      if (resumeLink) resumeLink.click();
      else console.log('Could not find /resume-builder link!');
    });
  } catch (e) {
    console.log('Click error:', e);
  }
  await new Promise(r => setTimeout(r, 2000));
  console.log('Current URL after click:', page.url());
  await browser.close();
})();
