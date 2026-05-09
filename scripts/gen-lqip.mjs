import sharp from 'sharp';
import { readdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const inDir = resolve(root, 'src/assets/screenshots');
const outFile = resolve(inDir, 'lqip.json');

const files = readdirSync(inDir).filter((f) => f.endsWith('.png'));
const lqip = {};

for (const file of files) {
  const buf = await sharp(resolve(inDir, file))
    .resize(40, 25, { fit: 'cover' })
    .blur(1.5)
    .jpeg({ quality: 40, mozjpeg: true })
    .toBuffer();
  const slug = file.replace('.png', '');
  lqip[slug] = `data:image/jpeg;base64,${buf.toString('base64')}`;
  console.log(`  ${slug}: ${buf.length} bytes`);
}

writeFileSync(outFile, JSON.stringify(lqip, null, 2) + '\n');
const totalBytes = JSON.stringify(lqip).length;
console.log(
  `\nWrote ${Object.keys(lqip).length} LQIPs to ${outFile} (${totalBytes} bytes JSON, ~${Math.round(totalBytes / Object.keys(lqip).length)} bytes avg)`,
);
