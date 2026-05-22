/**
 * Capture Wildland "after" screenshots from the local project.
 * Extracts a hero frame from hero-coffee.mp4 via canvas (no ffmpeg).
 */
import { chromium } from 'playwright';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, '../assets/images/wildland');
const WILDLAND_ROOT =
  process.env.WILDLAND_ROOT ||
  '/Users/ryleyjohnson/Desktop/web work/Wildland_imports/wildland-imports';
const PORT = Number(process.env.WILDLAND_PORT || 9876);
const BASE = `http://127.0.0.1:${PORT}/index.html`;
const HERO_POSTER = path.join(WILDLAND_ROOT, 'assets/images/hero-poster.jpg');

function startServer() {
  return new Promise((resolve, reject) => {
    const proc = spawn('python3', ['-m', 'http.server', String(PORT), '--bind', '127.0.0.1'], {
      cwd: WILDLAND_ROOT,
      stdio: 'ignore',
    });
    proc.on('error', reject);
    setTimeout(() => resolve(proc), 600);
  });
}

let heroFrameDataUrl = '';

/** Pull one frame from the hero MP4 in-browser. */
async function extractHeroFrame(page) {
  heroFrameDataUrl = await page.evaluate(async () => {
    const src = `${location.origin}/assets/videos/hero-coffee.mp4`;
    const video = document.createElement('video');
    video.muted = true;
    video.playsInline = true;
    video.preload = 'auto';
    video.src = src;

    await new Promise((resolve, reject) => {
      const t = setTimeout(() => reject(new Error('video load timeout')), 30000);
      video.addEventListener(
        'loadeddata',
        () => {
          clearTimeout(t);
          resolve();
        },
        { once: true }
      );
      video.addEventListener('error', () => reject(new Error('video error')), { once: true });
    });

    video.currentTime = 1.35;
    await new Promise((resolve) => {
      video.addEventListener('seeked', resolve, { once: true });
      setTimeout(resolve, 2000);
    });

    const w = video.videoWidth || 1280;
    const h = video.videoHeight || 720;
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    canvas.getContext('2d').drawImage(video, 0, 0, w, h);
    return canvas.toDataURL('image/jpeg', 0.9);
  });
  const buf = Buffer.from(heroFrameDataUrl.replace(/^data:image\/\w+;base64,/, ''), 'base64');
  fs.writeFileSync(HERO_POSTER, buf);
  console.log('hero-poster.jpg →', HERO_POSTER);
  return heroFrameDataUrl;
}

/** Show hero frame behind overlays (replaces broken headless video). */
async function applyHeroFrameToPage(page, dataUrl) {
  await page.evaluate((bg) => {
    const wrap = document.querySelector('.hero-video-wrap');
    const video = document.querySelector('video.hero-video');
    if (!wrap) return;
    if (video) video.style.display = 'none';
    wrap.style.backgroundImage = `url("${bg}")`;
    wrap.style.backgroundSize = 'cover';
    wrap.style.backgroundPosition = 'center top';
  }, dataUrl);
}

async function capture(page, viewport, filename, dataUrl) {
  await page.setViewportSize(viewport);
  await page.goto(BASE, { waitUntil: 'load', timeout: 30000 });
  await page.waitForTimeout(1200);
  await applyHeroFrameToPage(page, dataUrl);
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(OUT_DIR, filename), type: 'png' });
  console.log('wrote', filename);
}

const server = await startServer();
let browser;
try {
  browser = await chromium.launch({
    headless: true,
    channel: 'chrome',
  });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await page.goto(BASE, { waitUntil: 'load', timeout: 30000 });
  const frame = await extractHeroFrame(page);
  await capture(page, { width: 1280, height: 800 }, 'wildland-after.png', frame);
  await capture(page, { width: 390, height: 844 }, 'wildland-after-mobile.png', frame);
} finally {
  if (browser) await browser.close();
  server.kill('SIGTERM');
}
console.log('Done.');
