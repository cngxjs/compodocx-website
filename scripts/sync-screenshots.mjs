import { spawn } from 'node:child_process';
import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { setTimeout as wait } from 'node:timers/promises';

const root = fileURLToPath(new URL('..', import.meta.url));
const outDir = resolve(root, 'src/assets/screenshots');

const TARGETS = [
  { id: 'component-page', path: '/components/CngxCard.html' },
  { id: 'theming-tab', path: '/components/CngxCard.html#theming' },
  { id: 'source-viewer', path: '/sources/CngxCard.html' },
  { id: 'multi-version', path: '/version-switcher.html' },
];

const VIEWPORT = { width: 1280, height: 800 };
const DEV_PORT = 4173;
const READY_TIMEOUT_MS = 30_000;

async function importPlaywrightOrExit() {
  try {
    return await import('playwright');
  } catch {
    console.error(
      'playwright is not installed. Run:\n  npm i -D playwright\n  npx playwright install chromium',
    );
    process.exit(1);
  }
}

function spawnDevServer(repoPath) {
  const child = spawn('npm', ['run', 'dev', '--', '--port', String(DEV_PORT)], {
    cwd: repoPath,
    env: { ...process.env, FORCE_COLOR: '0' },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  return child;
}

async function waitForServer(url, timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {
      // not ready yet
    }
    await wait(500);
  }
  throw new Error(`dev server at ${url} did not become ready within ${timeoutMs}ms`);
}

async function captureMode(page, baseUrl, target, mode) {
  const url = `${baseUrl}${target.path}`;
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.evaluate((m) => {
    const html = document.documentElement;
    html.classList.toggle('dark', m === 'dark');
    try {
      localStorage.setItem('compodocx-darkmode', m === 'dark' ? 'true' : 'false');
    } catch {
      /* noop */
    }
  }, mode);
  await wait(400);
  const file = resolve(outDir, `${target.id}-${mode}.png`);
  await page.screenshot({ path: file, fullPage: false });
  return file;
}

async function main() {
  const repoPath = process.env.COMPODOCX_REPO;
  if (!repoPath) {
    console.error('Set COMPODOCX_REPO=/path/to/local/compodocx checkout');
    process.exit(1);
  }

  await mkdir(outDir, { recursive: true });
  const playwright = await importPlaywrightOrExit();

  console.log(`Spawning compodocx dev server in ${repoPath} on port ${DEV_PORT}`);
  const server = spawnDevServer(repoPath);
  server.stdout.on('data', () => {});
  server.stderr.on('data', () => {});

  const baseUrl = `http://localhost:${DEV_PORT}`;
  try {
    await waitForServer(baseUrl, READY_TIMEOUT_MS);
    console.log('Dev server ready, capturing screenshots');

    const browser = await playwright.chromium.launch();
    try {
      const context = await browser.newContext({ viewport: VIEWPORT, deviceScaleFactor: 2 });
      const page = await context.newPage();
      for (const target of TARGETS) {
        for (const mode of ['light', 'dark']) {
          await captureMode(page, baseUrl, target, mode);
          console.log(`  ${target.id}-${mode}.png`);
        }
      }
    } finally {
      await browser.close();
    }
  } finally {
    server.kill('SIGTERM');
    await wait(500);
    if (!server.killed) server.kill('SIGKILL');
  }

  console.log(`\nWrote ${TARGETS.length * 2} PNGs to ${outDir}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
