import { copyFile, readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const dist = resolve(root, 'dist');

async function copyIfExists(src, dest) {
  if (existsSync(src)) {
    await mkdir(dirname(dest), { recursive: true });
    await copyFile(src, dest);
    console.log(`copied: ${src} -> ${dest}`);
  }
}

await copyIfExists(resolve(root, 'manifest.json'), resolve(dist, 'manifest.json'));
await copyIfExists(resolve(root, 'service-worker.js'), resolve(dist, 'service-worker.js'));
await copyIfExists(resolve(root, '.nojekyll'), resolve(dist, '.nojekyll'));

const indexPath = resolve(dist, 'index.html');
if (existsSync(indexPath)) {
  let html = await readFile(indexPath, 'utf8');
  if (!html.includes('rel="manifest"')) {
    html = html.replace('</head>', '  <link rel="manifest" href="manifest.json">\n  </head>');
    await writeFile(indexPath, html);
  }
}

console.log('post-build done.');
