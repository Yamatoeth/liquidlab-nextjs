import fs from 'fs/promises';
import path from 'path';
import puppeteer from 'puppeteer';

// Config
const SRC_DIR = path.resolve(process.cwd(), 'animations-source');
const OUT_DIR = path.resolve(process.cwd(), 'public', 'animations-preview');
const VIEWPORT = { width: 800, height: 450 };
const WAIT_MS = 800; // extra wait after load

async function ensureDir(dir) {
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch (e) {
    // ignore
  }
}

async function listHtmlFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  return entries
    .filter((e) => e.isFile() && e.name.toLowerCase().endsWith('.html'))
    .map((e) => path.join(dir, e.name));
}

function filenameFromPath(filePath) {
  // produce id like 001-aurora (strip ext)
  return path.basename(filePath, path.extname(filePath));
}

async function capture(filePath, outPath, browser) {
  const page = await browser.newPage();
  await page.setViewport(VIEWPORT);

  const fileUrl = 'file://' + filePath;
  try {
      await page.goto(fileUrl, { waitUntil: 'networkidle2', timeout: 60000 });
    // allow animations to settle
      await page.waitForTimeout(1200); // extra wait after load

    // Optionally hide heavy UI if present
    // await page.evaluate(() => { /* hide elements */ });

      await page.screenshot({ path: outPath, type: 'png', clip: { x: 0, y: 0, width: VIEWPORT.width, height: VIEWPORT.height } });
    console.log('Saved', outPath);
  } catch (err) {
    console.error('Failed to capture', filePath, err?.message || err);
  } finally {
    await page.close();
  }
}

async function main() {
  await ensureDir(OUT_DIR);

  const files = await listHtmlFiles(SRC_DIR);
  if (!files.length) {
    console.error('No HTML files found in', SRC_DIR);
    process.exit(1);
  }

    const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  try {
    for (const f of files) {
      const id = filenameFromPath(f);
      const outFile = path.join(OUT_DIR, `${id}.png`);
      await capture(f, outFile, browser);
    }
  } finally {
    await browser.close();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
