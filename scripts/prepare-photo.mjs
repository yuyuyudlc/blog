import fs from 'node:fs/promises';
import { constants } from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { hashPhoto, projectDirectory } from './publish-photos.mjs';

/** Prepare a JPEG publishing copy, preserving the original outside Git. */
export async function preparePhoto({ root = projectDirectory, filename, originalFilename, archiveDirectory, maxEdge = 4000, maxBytes = 19.5 * 1024 * 1024, log = console.log }) {
  root = path.resolve(root);
  const input = await fs.realpath(path.resolve(root, filename));
  const inbox = await fs.realpath(path.join(root, 'photo'));
  const relative = path.relative(inbox, input);
  if (!relative || relative.startsWith('..') || path.isAbsolute(relative) || !/\.jpe?g$/i.test(input)) {
    throw new Error('请指定 photo/ 中的 JPG 或 JPEG 原图。');
  }
  if (!Number.isInteger(maxEdge) || maxEdge < 0) throw new Error('maxEdge 必须为非负整数，0 表示保留原尺寸。');
  const inputHash = hashPhoto(await fs.readFile(input));
  const source = originalFilename ? await fs.realpath(originalFilename) : input;
  const original = await fs.readFile(source);
  const originalHash = hashPhoto(original);
  const before = await sharp(original).metadata();
  let output;
  let quality;
  for (const candidate of maxEdge ? [90, 88, 85] : [96, 94, 92, 90]) {
    log(`生成${maxEdge ? `长边不超过 ${maxEdge}px 的` : '原尺寸'} JPEG 发布版本，质量 ${candidate}…`);
    let image = sharp(original).keepMetadata();
    if (maxEdge) image = image.resize({ width: maxEdge, height: maxEdge, fit: 'inside', withoutEnlargement: true });
    const bytes = await image.jpeg({ quality: candidate, mozjpeg: true, chromaSubsampling: maxEdge ? '4:2:0' : '4:4:4' }).toBuffer();
    if (bytes.length < maxBytes) { output = bytes; quality = candidate; break; }
  }
  if (!output) throw new Error('保持原尺寸和高质量时仍超过大小限制，原图未修改。');
  const after = await sharp(output).metadata();
  if (!maxEdge && (before.width !== after.width || before.height !== after.height)) throw new Error('输出尺寸不一致，原图未修改。');
  if (maxEdge && Math.max(after.width, after.height) > maxEdge) throw new Error('输出尺寸超过限制，原图未修改。');

  const archiveRoot = path.resolve(archiveDirectory || path.join(root, '..', `${path.basename(root)}-originals`));
  if (archiveRoot === root || !path.relative(root, archiveRoot).startsWith('..')) throw new Error('原图备份目录必须位于仓库外。');
  await fs.mkdir(archiveRoot, { recursive: true });
  const name = path.parse(input);
  let backup = path.resolve(archiveRoot, name.base);
  try {
    if (hashPhoto(await fs.readFile(backup)) !== originalHash) backup = path.resolve(archiveRoot, `${name.name}-${originalHash.slice(0, 12)}${name.ext}`);
  } catch (error) { if (error.code !== 'ENOENT') throw error; }
  if (path.dirname(backup) !== archiveRoot) throw new Error('备份路径无效。');
  try { await fs.copyFile(source, backup, constants.COPYFILE_EXCL); }
  catch (error) { if (error.code !== 'EEXIST') throw error; }
  if (hashPhoto(await fs.readFile(backup)) !== originalHash || hashPhoto(await fs.readFile(input)) !== inputHash) {
    throw new Error('原图备份校验失败或原图被修改，未替换发布文件。');
  }
  const temporary = path.join(root, '.photo-publish', `${randomUUID()}.jpg`);
  await fs.mkdir(path.dirname(temporary), { recursive: true });
  try {
    await fs.writeFile(temporary, output, { flag: 'wx' });
    await fs.rename(temporary, input);
  } finally { await fs.unlink(temporary).catch(() => {}); }
  const result = { backup, filename: input, width: after.width, height: after.height, bytes: output.length, quality, originalHash, publishHash: hashPhoto(output) };
  log(`发布版本 ${(output.length / 1024 / 1024).toFixed(2)} MiB，${after.width}×${after.height}；原图保存在 ${backup}`);
  return result;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const filename = process.argv[2];
  if (!filename) { console.error('用法：npm run photos:prepare -- "photo/照片.jpg"'); process.exitCode = 1; }
  else {
    const edge = process.argv.find((arg) => arg.startsWith('--max-edge='));
    preparePhoto({ filename, ...(edge ? { maxEdge: Number(edge.slice(11)) } : {}) }).catch((error) => { console.error(error.message); process.exitCode = 1; });
  }
}
