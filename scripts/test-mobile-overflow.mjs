#!/usr/bin/env node
/**
 * Mobile horizontal-overflow probe.
 *
 * Walks every published route at common mobile viewports and reports any
 * horizontal overflow (document.body.scrollWidth > window.innerWidth).
 * When overflow is detected, also dumps the narrowest descendant elements
 * forcing the layout — useful for tracing min-content propagation through
 * nowrap pills, code blocks, or non-shrinking flex items.
 *
 * Usage (with `npm run dev` running on :4321):
 *   node scripts/test-mobile-overflow.mjs
 *
 * Against a different host or the production build:
 *   BASE_URL=http://localhost:4322 node scripts/test-mobile-overflow.mjs
 *   BASE_URL=https://compodocx.dev node scripts/test-mobile-overflow.mjs
 *
 * Probe additional engines (chromium is the default; firefox catches
 * Gecko-only divergence):
 *   BROWSERS=chromium,firefox node scripts/test-mobile-overflow.mjs
 *
 * Watch the run with a real browser window (set SLOW_MO to throttle):
 *   HEADED=1 node scripts/test-mobile-overflow.mjs
 *   HEADED=1 SLOW_MO=300 node scripts/test-mobile-overflow.mjs
 *
 * Exits 0 when every route is clean, 1 on any overflow / load failure.
 */

import { chromium, firefox, devices } from 'playwright';

const BASE_URL = (process.env.BASE_URL ?? 'http://localhost:4321').replace(/\/$/, '');
const BROWSERS = (process.env.BROWSERS ?? 'chromium')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

const HEADED = process.env.HEADED === '1' || process.env.HEADED === 'true';
const SLOW_MO = Number(process.env.SLOW_MO ?? (HEADED ? 150 : 0));

// Probe set: smallest-still-supported up to a current 6.x" iPhone. Stays in the
// iOS family on purpose — Android viewports are similar enough that adding them
// rarely surfaces new overflow modes.
const PROFILES = [
  // iPhone SE 1st gen — 320 px is the narrowest viewport we still consider.
  {
    name: 'iphone-se',
    context: {
      viewport: { width: 320, height: 568 },
      isMobile: true,
      hasTouch: true,
      deviceScaleFactor: 2,
      userAgent:
        'Mozilla/5.0 (iPhone; CPU iPhone OS 13_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0 Mobile/15E148 Safari/604.1',
    },
  },
  // iPhone 8 / SE2 / 12 mini — 375 × 667 baseline.
  { name: 'iphone-8', context: devices['iPhone 8'] },
  // iPhone 14 / 15 standard — 390 × 844.
  { name: 'iphone-14', context: devices['iPhone 14'] },
];

// Keep in sync with the `guides` list in src/components/FeaturesSidebar.astro
// and the page list under src/pages/.
const ROUTES = [
  '/',
  '/guides/',
  '/guides/features/',
  '/guides/getting-started/',
  '/guides/usage/',
  '/guides/options/',
  '/guides/themes/',
  '/guides/comments/',
  '/guides/jsdoc-tags/',
  '/guides/routing/',
  '/guides/coverage/',
  '/guides/tips/',
  '/guides/playground/',
  '/guides/live-example/',
  '/guides/tab-configuration/',
  '/impressum/',
];

const ENGINES = { chromium, firefox };

// Runs in the page. Reports body width, viewport width, and the narrowest
// non-positioned descendants that exceed the viewport.
const probe = () => {
  const vw = window.innerWidth;
  const body = document.body.scrollWidth;
  if (body <= vw) return { vw, body, overflow: 0, culprits: [] };

  const culprits = [];
  document.querySelectorAll('*').forEach((el) => {
    const cs = getComputedStyle(el);
    if (cs.position === 'absolute' || cs.position === 'fixed') return;
    const r = el.getBoundingClientRect();
    if (r.width <= vw) return;
    const hasWiderChild = Array.from(el.children).some((c) => {
      const cr = c.getBoundingClientRect();
      const ccs = getComputedStyle(c);
      return cr.width > vw && ccs.position !== 'absolute' && ccs.position !== 'fixed';
    });
    if (hasWiderChild) return;
    culprits.push({
      tag: el.tagName.toLowerCase(),
      cls: (el.getAttribute('class') || '')
        .split(/\s+/)
        .filter((c) => c && !c.startsWith('astro-'))
        .slice(0, 4)
        .join(' ')
        .slice(0, 90),
      width: Math.round(r.width),
      whiteSpace: cs.whiteSpace,
      text: (el.textContent || '').slice(0, 60).replace(/\s+/g, ' ').trim(),
    });
  });

  const seen = new Set();
  const dedup = culprits.filter((c) => {
    const k = `${c.cls}|${c.text}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
  return { vw, body, overflow: body - vw, culprits: dedup.slice(0, 5) };
};

const pad = (s, n) => s + ' '.repeat(Math.max(0, n - s.length));

let totalChecks = 0;
let totalFailures = 0;

for (const browserName of BROWSERS) {
  const launcher = ENGINES[browserName];
  if (!launcher) {
    console.error(`unknown browser: ${browserName} (use chromium or firefox)`);
    process.exit(2);
  }

  const browser = await launcher.launch({ headless: !HEADED, slowMo: SLOW_MO });
  console.log(
    `\n[${browserName}]  base=${BASE_URL}${HEADED ? '  (headed)' : ''}${SLOW_MO ? `  slowMo=${SLOW_MO}ms` : ''}`,
  );

  for (const profile of PROFILES) {
    // Firefox does not implement Playwright's mobile emulation flags
    // (isMobile / hasTouch / deviceScaleFactor). Strip them and keep just the
    // viewport + UA — that still triggers the responsive CSS we care about.
    const ctxOpts =
      browserName === 'firefox'
        ? {
            viewport: profile.context.viewport,
            userAgent: profile.context.userAgent,
          }
        : profile.context;
    const ctx = await browser.newContext(ctxOpts);
    const page = await ctx.newPage();
    const { width, height } = profile.context.viewport;
    console.log(`  ${profile.name} (${width}x${height})`);

    for (const route of ROUTES) {
      totalChecks++;
      const url = BASE_URL + route;
      try {
        await page.goto(url, { waitUntil: 'load', timeout: 20_000 });
        // Allow CSS-driven enter animations (section-reveal, hero shimmer)
        // to settle so transient widths do not skew the measurement.
        await page.waitForTimeout(300);
        const result = await page.evaluate(probe);
        if (result.overflow === 0) {
          console.log(`    OK   ${pad(route, 36)} body=${result.body}px`);
        } else {
          totalFailures++;
          console.log(
            `    FAIL ${pad(route, 36)} body=${result.body} > vw=${result.vw} (+${result.overflow}px)`,
          );
          for (const c of result.culprits) {
            const text = c.text ? `  "${c.text}"` : '';
            console.log(`         -> ${c.tag}.${c.cls} (${c.width}px ws=${c.whiteSpace})${text}`);
          }
        }
      } catch (err) {
        totalFailures++;
        const msg = err instanceof Error ? err.message.split('\n')[0] : String(err);
        console.log(`    ERR  ${pad(route, 36)} ${msg}`);
      }
    }

    await ctx.close();
  }

  await browser.close();
}

const passed = totalChecks - totalFailures;
console.log(`\n${totalFailures === 0 ? 'PASS' : 'FAIL'}: ${passed}/${totalChecks} routes ok`);
process.exit(totalFailures === 0 ? 0 : 1);
