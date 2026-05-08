import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = fileURLToPath(new URL('..', import.meta.url));
const outOg = resolve(root, 'public/og-image.png');
const outAppleTouch = resolve(root, 'public/apple-touch-icon.png');
const outFavicon = resolve(root, 'public/favicon.png');

const ogSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
  <defs>
    <radialGradient id="g1" cx="20%" cy="35%" r="55%">
      <stop offset="0%" stop-color="#262626" stop-opacity="0.18"/>
      <stop offset="100%" stop-color="#262626" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="g2" cx="85%" cy="80%" r="50%">
      <stop offset="0%" stop-color="#d6d6d6" stop-opacity="0.45"/>
      <stop offset="100%" stop-color="#d6d6d6" stop-opacity="0"/>
    </radialGradient>
    <pattern id="dots" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
      <circle cx="1" cy="1" r="1" fill="#1f1f1f" fill-opacity="0.08"/>
    </pattern>
    <linearGradient id="shimmer" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="hsl(35 100% 62%)"/>
      <stop offset="50%" stop-color="hsl(20 100% 65%)"/>
      <stop offset="100%" stop-color="hsl(35 100% 62%)"/>
    </linearGradient>
  </defs>

  <rect width="1200" height="630" fill="#f5f5f5"/>
  <rect width="1200" height="630" fill="url(#dots)"/>
  <rect width="1200" height="630" fill="url(#g1)"/>
  <rect width="1200" height="630" fill="url(#g2)"/>

  <text x="96" y="158" font-family="-apple-system, BlinkMacSystemFont, system-ui, sans-serif" font-size="44" font-weight="600" fill="#7a7a7a" letter-spacing="3">COMPODOCX</text>

  <text x="96" y="290" font-family="-apple-system, BlinkMacSystemFont, system-ui, sans-serif" font-size="84" font-weight="700" fill="url(#shimmer)" letter-spacing="-2">Modern documentation</text>
  <text x="96" y="380" font-family="-apple-system, BlinkMacSystemFont, system-ui, sans-serif" font-size="84" font-weight="700" fill="#1f1f1f" letter-spacing="-2">for Angular projects</text>

  <text x="96" y="450" font-family="-apple-system, BlinkMacSystemFont, system-ui, sans-serif" font-size="28" font-weight="400" fill="#525252">Standalone-first · Signals · Multi-version · Theming · Migration tools</text>

  <g transform="translate(96, 510)">
    <rect width="660" height="64" rx="14" fill="#ffffff" stroke="#dbdbdb" stroke-width="1"/>
    <text x="28" y="42" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="24" fill="#7a7a7a">$</text>
    <text x="60" y="42" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="24" fill="#1f1f1f">npm install -D @cngxjs/compodocx</text>
  </g>

  <g transform="translate(782, 510)">
    <rect width="180" height="64" rx="14" fill="#262626"/>
    <text x="40" y="42" font-family="-apple-system, BlinkMacSystemFont, system-ui, sans-serif" font-size="22" font-weight="500" fill="#f5f5f5">Get Started</text>
  </g>

  <g transform="translate(1000, 80)" opacity="0.5">
    <rect x="0" y="0" width="40" height="40" rx="6" fill="none" stroke="#262626" stroke-width="2" transform="rotate(15 20 20)"/>
    <rect x="60" y="40" width="40" height="40" rx="6" fill="none" stroke="#262626" stroke-width="2" transform="rotate(-10 80 60)"/>
    <rect x="30" y="100" width="40" height="40" rx="6" fill="none" stroke="#262626" stroke-width="2" transform="rotate(25 50 120)"/>
    <rect x="120" y="80" width="40" height="40" rx="6" fill="none" stroke="#262626" stroke-width="2" transform="rotate(-5 140 100)"/>
  </g>
</svg>`;

const appleSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 180" width="180" height="180">
  <rect width="180" height="180" rx="40" fill="#1c1c1c"/>
  <text x="90" y="105" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, system-ui, sans-serif" font-size="56" font-weight="700" fill="#f5f5f5">cx</text>
  <circle cx="142" cy="50" r="6" fill="hsl(35 100% 62%)"/>
</svg>`;

const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
  <rect width="32" height="32" rx="6" fill="#1c1c1c"/>
  <text x="16" y="22" text-anchor="middle" font-family="-apple-system, system-ui, sans-serif" font-size="16" font-weight="700" fill="#f5f5f5">cx</text>
</svg>`;

async function svgToPng(svg, width, height) {
  return sharp(Buffer.from(svg)).resize(width, height).png({ compressionLevel: 9 }).toBuffer();
}

const ogPng = await svgToPng(ogSvg, 1200, 630);
await writeFile(outOg, ogPng);
console.log(`Wrote ${outOg} (${ogPng.length} bytes)`);

const applePng = await svgToPng(appleSvg, 180, 180);
await writeFile(outAppleTouch, applePng);
console.log(`Wrote ${outAppleTouch} (${applePng.length} bytes)`);

const faviconPng = await svgToPng(faviconSvg, 32, 32);
await writeFile(outFavicon, faviconPng);
console.log(`Wrote ${outFavicon} (${faviconPng.length} bytes)`);
