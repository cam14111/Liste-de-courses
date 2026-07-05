import { copyFile, readFile, writeFile, mkdir, readdir, unlink } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
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
// Manuel utilisateur lié depuis le header (📖) — sans lui, 404 en production
await copyIfExists(resolve(root, 'manuel.html'), resolve(dist, 'manuel.html'));

const iconsDir = resolve(root, 'icons');
if (existsSync(iconsDir)) {
  for (const entry of await readdir(iconsDir)) {
    await copyIfExists(join(iconsDir, entry), join(dist, 'icons', entry));
  }
}

// Supprime les doublons hashés produits par Vite (manifest, icônes) —
// les fichiers canoniques sont copiés ci-dessus.
const entries = await readdir(dist);
for (const entry of entries) {
  if (/^manifest-[\w-]+\.json$/.test(entry) || /^(icon|apple-touch-icon)[\w-]*\.png$/.test(entry)) {
    await unlink(join(dist, entry));
    console.log(`removed duplicate: ${entry}`);
  }
}

const indexPath = resolve(dist, 'index.html');
if (existsSync(indexPath)) {
  let html = await readFile(indexPath, 'utf8');
  // Pointe manifest et icônes vers les fichiers non-hashés déposés par le post-build
  html = html.replace(/href="\.?\/?manifest-[\w-]+\.json"/g, 'href="manifest.json"');
  html = html.replace(/href="\.?\/?icon-192-[\w-]+\.png"/g, 'href="icons/icon-192.png"');
  html = html.replace(
    /href="\.?\/?apple-touch-icon-[\w-]+\.png"/g,
    'href="icons/apple-touch-icon.png"',
  );
  if (!html.includes('rel="manifest"')) {
    html = html.replace('</head>', '  <link rel="manifest" href="manifest.json">\n  </head>');
  }
  await writeFile(indexPath, html);
}

console.log('post-build done.');
