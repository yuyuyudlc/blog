import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { mkdir, readFile, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';
import nextEnv from '@next/env';
import sharp from 'sharp';
import { isPicuiImage } from '../src/config/images.mjs';
import { photoVariantDirectory, photoVariantPath, photoVariantSizes } from '../src/config/photo-variants.mjs';
import { downloadImageViaSsh } from './lib/picui.mjs';

const posts = new URL('../posts/', import.meta.url);
nextEnv.loadEnvConfig(fileURLToPath(new URL('../', import.meta.url)));
await mkdir(outputPath(photoVariantDirectory), { recursive: true });

for (const filename of await readdir(posts)) {
  if (!filename.endsWith('.md')) continue;
  const { data } = matter(await readFile(new URL(filename, posts), 'utf8'));
  if (data.category !== 'photos') continue;

  const missingSizes = Object.values(photoVariantSizes).filter((size) =>
    !existsSync(outputPath(photoVariantPath(data.photoHash, size))),
  );
  if (!missingSizes.length) continue;

  const original = await downloadOriginal(data, filename);
  for (const size of missingSizes) {
    await sharp(original, { animated: true }).autoOrient()
      .resize(size, size, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(outputPath(photoVariantPath(data.photoHash, size)));
  }
  console.log(`已生成 ${filename} 的照片展示图。`);
}

function outputPath(pathname) {
  return fileURLToPath(new URL(`../public${pathname}`, import.meta.url));
}

async function downloadOriginal(photo, filename) {
  const bytes = process.env.PICUI_SSH_HOST && isPicuiImage(photo.coverImage)
    ? await downloadImageViaSsh(photo.coverImage)
    : await fetchOriginal(photo.coverImage, filename);
  if (createHash('sha256').update(bytes).digest('hex') !== photo.photoHash) {
    throw new Error(`${filename}：图床原图的 SHA-256 与照片记录不一致。`);
  }
  return bytes;
}

async function fetchOriginal(url, filename) {
  const response = await fetch(url, { signal: AbortSignal.timeout(120_000) });
  if (!response.ok) throw new Error(`${filename}：图床返回 HTTP ${response.status}`);
  return Buffer.from(await response.arrayBuffer());
}
