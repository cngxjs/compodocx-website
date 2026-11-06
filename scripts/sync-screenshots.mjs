/**
 * Captures landing-page screenshots from a real compodocx output.
 *
 * Pipeline:
 *   1. Build the chosen fixture twice with --versionLabel so the multi-version
 *      switcher has more than one entry to show.
 *   2. Serve the multi-version root via sirv-cli on a local port.
 *   3. Drive playwright through six target views, light + dark, scroll into
 *      sticky-source-scope context for the source-viewer shot, and click the
 *      version-switcher trigger open for the multi-version shot.
 *
 * Required:
 *   COMPODOCX_REPO=/path/to/local/compodocx checkout
 *
 * Optional:
 *   COMPODOCX_FIXTURE=kitchen-sink-standalone (default)
 *   COMPODOCX_COMPONENT=SignalCardComponent (default)
 *   COMPODOCX_FEATURE_DIR=shared (default)
 *   ONLY=<target id>  capture only one target id (e.g. ONLY=source-viewer)
 */
import { spawn } from 'node:child_process';
import { mkdir, rm } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';
import { setTimeout as wait } from 'node:timers/promises';

const root = fileURLToPath(new URL('..', import.meta.url));
const outDir = resolve(root, 'src/assets/screenshots');

const FIXTURE = process.env.COMPODOCX_FIXTURE ?? 'kitchen-sink-standalone';
const COMPONENT = process.env.COMPODOCX_COMPONENT ?? 'SignalCardComponent';
// Symbol pages live in the folder of their feature since compodocx 0.9.
const FEATURE_DIR = process.env.COMPODOCX_FEATURE_DIR ?? 'shared';
const COMPONENT_PATH = `/${FEATURE_DIR}/${COMPONENT}.html`;
// Shown in the sidebar header and on the overview hero of every shot.
const DOC_NAME = 'acme-admin-console';
const ONLY = process.env.ONLY;
const repoPath = process.env.COMPODOCX_REPO;

if (!repoPath) {
  console.error('Set COMPODOCX_REPO=/path/to/local/compodocx checkout');
  process.exit(1);
}

const buildOut = join(tmpdir(), 'compodocx-screenshots-out');
const baseUrl = 'http://localhost:4173/v1.1.0';
const VIEWPORT = { width: 1280, height: 800 };

const TARGETS = [
  {
    id: 'component-info',
    path: COMPONENT_PATH,
  },
  {
    id: 'component-api',
    path: `${COMPONENT_PATH}#api`,
  },
  {
    id: 'project-graph',
    path: '/overview.html',
    // Skips the build-up animation, so the graph is captured in its final state.
    reducedMotion: 'reduce',
  },
  {
    id: 'source-viewer',
    path: `${COMPONENT_PATH}#source`,
    prepare: async (page) => {
      // Scroll into a method body so the VSCode-style sticky-stack
      // accumulates surrounding class + method context.
      await page.evaluate(() => {
        const lines = document.querySelectorAll('.cdx-source-viewer .line');
        const target = Math.min(160, lines.length - 1);
        if (target > 0) {
          lines[target].scrollIntoView({ block: 'center', behavior: 'instant' });
        }
      });
      await wait(800);
    },
  },
  {
    id: 'coverage-report',
    path: '/coverage.html',
  },
  {
    id: 'multi-version',
    path: COMPONENT_PATH,
    prepare: async (page) => {
      const trigger = page.locator('.cdx-version-switcher-trigger:visible');
      await trigger.first().click();
    },
  },
];

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

function runCli(args) {
  return new Promise((resolveExec, rejectExec) => {
    // Run from the fixture so entity pages show src/app/... instead of test/fixtures/....
    const child = spawn('node', [resolve(repoPath, 'bin/index-cli.js'), ...args], {
      cwd: resolve(repoPath, 'test/fixtures', FIXTURE),
      stdio: ['ignore', 'pipe', 'inherit'],
    });
    child.stdout.on('data', () => {});
    child.on('exit', (code) =>
      code === 0 ? resolveExec() : rejectExec(new Error(`compodocx exited ${code}`)),
    );
  });
}

function spawnStaticServer() {
  const child = spawn('npx', ['--yes', 'sirv-cli', buildOut, '--port', '4173', '--quiet'], {
    cwd: root,
    env: { ...process.env, FORCE_COLOR: '0' },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  child.stdout.on('data', () => {});
  child.stderr.on('data', () => {});
  return child;
}

async function waitForServer(url, timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {
      /* not ready yet */
    }
    await wait(300);
  }
  throw new Error(`server at ${url} did not become ready within ${timeoutMs}ms`);
}

async function captureMode(browser, target, mode) {
  const context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: 2,
    colorScheme: mode,
    reducedMotion: target.reducedMotion ?? 'no-preference',
  });
  const stateValue = mode === 'dark' ? 'true' : 'false';
  await context.addInitScript((v) => {
    try {
      localStorage.setItem('compodocx_darkmode-state', v);
    } catch {
      /* noop */
    }
  }, stateValue);
  const page = await context.newPage();
  try {
    const url = `${baseUrl}${target.path}`;
    const response = await page.goto(url, { waitUntil: 'networkidle' });
    if (!response?.ok()) {
      throw new Error(`${url} answered ${response?.status()}; check COMPODOCX_FEATURE_DIR`);
    }
    await wait(400);
    if (typeof target.prepare === 'function') {
      await target.prepare(page);
      await wait(300);
    }
    const file = resolve(outDir, `${target.id}-${mode}.png`);
    await page.screenshot({ path: file, fullPage: false });
  } finally {
    await context.close();
  }
}

async function main() {
  await mkdir(outDir, { recursive: true });

  console.log(`Building ${FIXTURE} twice into ${buildOut}`);
  await rm(buildOut, { recursive: true, force: true });
  const buildArgs = ['-p', 'tsconfig.json', '-d', buildOut, '-n', DOC_NAME];
  await runCli([...buildArgs, '--versionLabel', 'v1.0.0']);
  await runCli([...buildArgs, '--versionLabel', 'v1.1.0']);

  const playwright = await importPlaywrightOrExit();
  console.log('Spawning static server on :4173');
  const server = spawnStaticServer();
  try {
    await waitForServer(`${baseUrl}/index.html`, 30_000);
    console.log('Server ready, capturing screenshots');
    const browser = await playwright.chromium.launch();
    try {
      for (const target of TARGETS) {
        if (ONLY && target.id !== ONLY) continue;
        for (const mode of ['light', 'dark']) {
          await captureMode(browser, target, mode);
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

  console.log(`\nDone. PNGs in ${outDir}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
