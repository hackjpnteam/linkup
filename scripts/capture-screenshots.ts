import puppeteer from 'puppeteer';
import path from 'path';

const BASE_URL = 'https://linkup-app-livid.vercel.app';

const pages = [
  { name: 'login', path: '/login', waitFor: 2000 },
  { name: 'dashboard', path: '/student/dashboard', waitFor: 3000 },
  { name: 'vocab-list', path: '/student/vocab', waitFor: 3000 },
  { name: 'grammar-list', path: '/student/grammar', waitFor: 3000 },
  { name: 'pronunciation-list', path: '/student/pronunciation', waitFor: 3000 },
  { name: 'calendar', path: '/student/calendar', waitFor: 3000 },
  { name: 'assignments', path: '/student/assignments', waitFor: 3000 },
];

async function captureScreenshots() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  const outputDir = path.join(process.cwd(), 'public', 'screenshots');

  // First, login
  console.log('Logging in...');
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle2' });
  await page.waitForSelector('input[type="email"]', { timeout: 10000 });

  // Take login page screenshot first
  await page.screenshot({ path: path.join(outputDir, 'login.png') });
  console.log('Captured: login');

  // Fill login form
  await page.type('input[type="email"]', 'tomtysmile5017@gmail.com');
  await page.type('input[type="password"]', 'password123');

  // Click login button
  await page.click('button[type="submit"]');

  // Wait for redirect
  await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 }).catch(() => {});
  await new Promise(r => setTimeout(r, 3000));

  // Capture each page
  for (const pageInfo of pages.slice(1)) {
    try {
      console.log(`Navigating to ${pageInfo.path}...`);
      await page.goto(`${BASE_URL}${pageInfo.path}`, { waitUntil: 'networkidle2', timeout: 15000 });
      await new Promise(r => setTimeout(r, pageInfo.waitFor));

      await page.screenshot({ path: path.join(outputDir, `${pageInfo.name}.png`) });
      console.log(`Captured: ${pageInfo.name}`);
    } catch (error) {
      console.error(`Error capturing ${pageInfo.name}:`, error);
    }
  }

  await browser.close();
  console.log('Done!');
}

captureScreenshots().catch(console.error);
