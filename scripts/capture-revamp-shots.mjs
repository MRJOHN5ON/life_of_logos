/**
 * Capture before/after screenshots for revamp case studies.
 * Usage: node scripts/capture-revamp-shots.mjs [id]
 * ids: northwest-wax | lingua-franca | all
 */
import { chromium } from 'playwright';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '../assets/images');

const REVAMPS = {
  'northwest-wax': {
    before: 'https://www.northwestwaxbeaverton.com/#about',
    after: 'https://mrjohn5on.github.io/nw_wax_tori/about.html',
  },
  'lingua-franca': {
    before: 'https://www.linguafrancainstitute.com/',
    afterPath: '/about.html',
    localRoot: '/Users/ryleyjohnson/Desktop/web work/cory/classes-with-cory',
    port: 9881,
  },
};

function startServer(cwd, port) {
  return new Promise((resolve, reject) => {
    const proc = spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1'], {
      cwd,
      stdio: 'ignore',
    });
    proc.on('error', reject);
    setTimeout(() => resolve(proc), 700);
  });
}

async function shot(page, url, outPath, viewport) {
  await page.setViewportSize(viewport);
  await page.goto(url, { waitUntil: 'load', timeout: 90000 });
  await page.waitForTimeout(15000);
  await page.screenshot({ path: outPath, type: 'png' });
  console.log('  ', path.basename(outPath));
}

async function captureId(browser, id, serverProc) {
  const cfg = REVAMPS[id];
  const before = cfg.before;
  const after = cfg.after
    || `http://127.0.0.1:${cfg.port}${cfg.afterPath || '/'}`;
  const dir = path.join(ROOT, id);
  fs.mkdirSync(dir, { recursive: true });
  const page = await browser.newPage();
  console.log(id);
  await shot(page, before, path.join(dir, `${id}-before.png`), { width: 1280, height: 800 });
  await shot(page, after, path.join(dir, `${id}-after.png`), { width: 1280, height: 800 });
  await shot(page, before, path.join(dir, `${id}-before-mobile.png`), { width: 390, height: 844 });
  await shot(page, after, path.join(dir, `${id}-after-mobile.png`), { width: 390, height: 844 });

  if (id === 'lingua-franca' && cfg.localRoot) {
    const base = `http://127.0.0.1:${cfg.port}`;
    await shot(page, `${base}/index.html`, path.join(dir, 'cory-home.png'), { width: 1280, height: 800 });
    await page.goto(`${base}/index.html`, { waitUntil: 'load', timeout: 60000 });
    await page.waitForTimeout(3000);
    await page.locator('.site-header').screenshot({ path: path.join(dir, 'cory-lang-en.png'), type: 'png' });
    await page.click('[data-set-lang="es"]');
    await page.waitForTimeout(800);
    await page.locator('.site-header').screenshot({ path: path.join(dir, 'cory-lang-es.png'), type: 'png' });
    console.log('   cory-home.png, cory-lang-en.png, cory-lang-es.png');
  }

  await page.close();
}

const arg = process.argv[2] || 'all';
const ids = arg === 'all' ? Object.keys(REVAMPS) : [arg];

const browser = await chromium.launch({ headless: true, channel: 'chrome' });
let localServer;
try {
  if (ids.includes('lingua-franca') && REVAMPS['lingua-franca'].localRoot) {
    localServer = await startServer(REVAMPS['lingua-franca'].localRoot, REVAMPS['lingua-franca'].port);
  }
  for (const id of ids) {
    if (!REVAMPS[id]) {
      console.error('Unknown id:', id);
      process.exit(1);
    }
    await captureId(browser, id, localServer);
  }
} finally {
  if (localServer) localServer.kill('SIGTERM');
  await browser.close();
}
console.log('Done.');
