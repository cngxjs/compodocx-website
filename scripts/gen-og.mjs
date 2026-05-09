import { writeFile, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = fileURLToPath(new URL('..', import.meta.url));
const outOg = resolve(root, 'public/og-image.png');
const outAppleTouch = resolve(root, 'public/apple-touch-icon.png');
const outFavicon = resolve(root, 'public/favicon.png');
const outIcon192 = resolve(root, 'public/icon-192.png');
const outIcon512 = resolve(root, 'public/icon-512.png');
const outIconMaskable = resolve(root, 'public/icon-maskable-512.png');

// Crop screenshot to content area only: skip sidebar (left ~560px) and topbar (top ~80px).
// Source 2560×1600 → extract 1600×1400 → ratio 1.143:1, same as target panel 720×630.
const screenshotCrop = await sharp(resolve(root, 'src/assets/screenshots/component-info-dark.png'))
  .extract({ left: 560, top: 80, width: 1600, height: 1400 })
  .resize(720, 630, { fit: 'cover', position: 'top' })
  .toBuffer();
const screenshotB64 = screenshotCrop.toString('base64');

// Fade gradient overlay (720×630, left edge fades to transparent, right+top+bottom edges darkened).
const fadeSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 630" width="720" height="630">
  <defs>
    <linearGradient id="fl" x1="0" x2="1" y1="0" y2="0">
      <stop offset="0%" stop-color="#1c1c1c" stop-opacity="1"/>
      <stop offset="55%" stop-color="#1c1c1c" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="fr" x1="0" x2="1" y1="0" y2="0">
      <stop offset="60%" stop-color="#1c1c1c" stop-opacity="0"/>
      <stop offset="100%" stop-color="#1c1c1c" stop-opacity="0.6"/>
    </linearGradient>
    <linearGradient id="ft" x1="0" x2="0" y1="0" y2="1">
      <stop offset="0%" stop-color="#1c1c1c" stop-opacity="0.5"/>
      <stop offset="30%" stop-color="#1c1c1c" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="fb" x1="0" x2="0" y1="0" y2="1">
      <stop offset="70%" stop-color="#1c1c1c" stop-opacity="0"/>
      <stop offset="100%" stop-color="#1c1c1c" stop-opacity="0.5"/>
    </linearGradient>
  </defs>
  <rect width="720" height="630" fill="url(#fl)"/>
  <rect width="720" height="630" fill="url(#fr)"/>
  <rect width="720" height="630" fill="url(#ft)"/>
  <rect width="720" height="630" fill="url(#fb)"/>
</svg>`;
const fadeBuffer = await sharp(Buffer.from(fadeSvg)).resize(720, 630).toBuffer();

const ogTextSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
  <defs>
    <pattern id="dots" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
      <circle cx="1" cy="1" r="1" fill="#f0f0f0" fill-opacity="0.07"/>
    </pattern>
  </defs>

  <rect width="1200" height="630" fill="#1c1c1c"/>
  <rect width="1200" height="630" fill="url(#dots)"/>

  <text x="64" y="152"
        font-family="'Helvetica Neue', Helvetica, Arial, sans-serif"
        font-size="14" font-weight="500" fill="#555555" letter-spacing="2.5">CLI DOCUMENTATION TOOL · ANGULAR</text>

  <text x="64" y="240"
        font-family="'Helvetica Neue', Helvetica, Arial, sans-serif"
        font-size="82" font-weight="700" fill="#f0f0f0" letter-spacing="-2">compo</text>

  <text x="64" y="326"
        font-family="'Helvetica Neue', Helvetica, Arial, sans-serif"
        font-size="82" font-weight="700" letter-spacing="-2"><tspan fill="#f0f0f0">doc</tspan><tspan fill="hsl(32,100%,62%)">x</tspan></text>

  <text x="64" y="384"
        font-family="'Helvetica Neue', Helvetica, Arial, sans-serif"
        font-size="22" font-weight="400" fill="#8a8a8a">Modern Angular documentation</text>

  <text x="64" y="416"
        font-family="'Helvetica Neue', Helvetica, Arial, sans-serif"
        font-size="16" font-weight="400" fill="#555555">Signals · Multi-version · Theming · Coverage</text>

  <rect x="64" y="440" width="410" height="46" rx="9" fill="#242424" stroke="#333333" stroke-width="1"/>
  <text x="86" y="470"
        font-family="ui-monospace, 'SF Mono', Menlo, Consolas, monospace"
        font-size="15" fill="#555555">$</text>
  <text x="106" y="470"
        font-family="ui-monospace, 'SF Mono', Menlo, Consolas, monospace"
        font-size="15" fill="#c8c8c8">npm install -D @cngxjs/compodocx</text>

  <text x="64" y="552"
        font-family="'Helvetica Neue', Helvetica, Arial, sans-serif"
        font-size="16" fill="#404040">compodocx.dev</text>
</svg>`;

const appleSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 180" width="180" height="180">
  <defs>
    <pattern id="dots" x="0" y="0" width="14" height="14" patternUnits="userSpaceOnUse">
      <circle cx="1" cy="1" r="1" fill="#f0f0f0" fill-opacity="0.14"/>
    </pattern>
  </defs>
  <rect width="180" height="180" rx="40" fill="#1c1c1c"/>
  <rect width="180" height="180" rx="40" fill="url(#dots)"/>
  <text x="90" y="82" text-anchor="middle"
        font-family="'Source Sans 3', 'Helvetica Neue', Helvetica, sans-serif"
        font-size="52" font-weight="700" fill="#f0f0f0" letter-spacing="-1">compo</text>
  <text x="90" y="140" text-anchor="middle"
        font-family="'Source Sans 3', 'Helvetica Neue', Helvetica, sans-serif"
        font-size="52" font-weight="700" letter-spacing="-1">
    <tspan fill="#f0f0f0">doc</tspan><tspan fill="hsl(32,100%,62%)">x</tspan>
  </text>
</svg>`;

// Scale appleSvg to any size — viewBox stays 0 0 180 180 so librsvg scales proportionally.
function iconSvgAt(size) {
  return appleSvg.replace('width="180" height="180"', `width="${size}" height="${size}"`);
}

// Maskable variant: full-bleed (no rx) so the OS can apply its own shape mask.
// Content is pulled inward to fit the W3C maskable safe zone (inscribed circle, r = 40% of 180 = 72 units).
const maskableSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 180" width="512" height="512">
  <defs>
    <pattern id="dots" x="0" y="0" width="14" height="14" patternUnits="userSpaceOnUse">
      <circle cx="1" cy="1" r="1" fill="#f0f0f0" fill-opacity="0.14"/>
    </pattern>
  </defs>
  <rect width="180" height="180" fill="#1c1c1c"/>
  <rect width="180" height="180" fill="url(#dots)"/>
  <text x="90" y="78" text-anchor="middle"
        font-family="'Helvetica Neue', Helvetica, sans-serif"
        font-size="46" font-weight="700" fill="#f0f0f0" letter-spacing="-1">compo</text>
  <text x="90" y="128" text-anchor="middle"
        font-family="'Helvetica Neue', Helvetica, sans-serif"
        font-size="46" font-weight="700" letter-spacing="-1">
    <tspan fill="#f0f0f0">doc</tspan><tspan fill="hsl(32,100%,62%)">x</tspan>
  </text>
</svg>`;

const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
  <defs>
    <linearGradient id="cx-fill" x1="0" x2="1" y1="0" y2="0">
      <stop offset="50%" stop-color="#f0f0f0"/>
      <stop offset="50%" stop-color="hsl(32, 100%, 60%)"/>
    </linearGradient>
  </defs>
  <rect width="32" height="32" rx="6" fill="#1c1c1c"/>
  <text x="16" y="22" text-anchor="middle" font-family="'Helvetica Neue', Helvetica, Arial, sans-serif" font-size="16" font-weight="700" fill="url(#cx-fill)">cx</text>
</svg>`;

async function svgToPng(svg, width, height) {
  return sharp(Buffer.from(svg)).resize(width, height).png({ compressionLevel: 9 }).toBuffer();
}

// OG image: render text+bg, then composite screenshot + fade on top.
const ogBase = await sharp(Buffer.from(ogTextSvg)).resize(1200, 630).toBuffer();
const ogPng = await sharp(ogBase)
  .composite([
    { input: screenshotCrop, left: 480, top: 0, blend: 'over' },
    { input: fadeBuffer, left: 480, top: 0, blend: 'over' },
  ])
  .png({ compressionLevel: 9 })
  .toBuffer();
await writeFile(outOg, ogPng);
console.log(`Wrote ${outOg} (${ogPng.length} bytes)`);

const applePng = await svgToPng(appleSvg, 180, 180);
await writeFile(outAppleTouch, applePng);
console.log(`Wrote ${outAppleTouch} (${applePng.length} bytes)`);

const faviconPng = await svgToPng(faviconSvg, 32, 32);
await writeFile(outFavicon, faviconPng);
console.log(`Wrote ${outFavicon} (${faviconPng.length} bytes)`);

const icon192Png = await svgToPng(iconSvgAt(192), 192, 192);
await writeFile(outIcon192, icon192Png);
console.log(`Wrote ${outIcon192} (${icon192Png.length} bytes)`);

const icon512Png = await svgToPng(iconSvgAt(512), 512, 512);
await writeFile(outIcon512, icon512Png);
console.log(`Wrote ${outIcon512} (${icon512Png.length} bytes)`);

const iconMaskablePng = await svgToPng(maskableSvg, 512, 512);
await writeFile(outIconMaskable, iconMaskablePng);
console.log(`Wrote ${outIconMaskable} (${iconMaskablePng.length} bytes)`);
