import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';
import nextEnv from '@next/env';
import { isPicuiImage } from '../src/config/images.mjs';
import { createPicuiClient, imageLink, imageMimeTypes, checkImageSize, verifyImageViaSsh } from './lib/picui.mjs';
import { createMetadataReader, photoMetadata } from './lib/photo-metadata.mjs';
import { lock, photoFiles, readJson, writeJson, writeNewPost } from './lib/photo-files.mjs';
import { photoRecordErrors } from './lib/photo-records.mjs';

export const projectDirectory = fileURLToPath(new URL('../', import.meta.url));
export const hashPhoto = (bytes) => createHash('sha256').update(bytes).digest('hex');
const md5 = (bytes) => createHash('md5').update(bytes).digest('hex');

async function publishedRecords(root) {
  const files = await fs.readdir(path.join(root, 'posts'));
  const records = new Map();
  for (const file of files.filter((file) => file.endsWith('.md'))) {
    const filename = path.join(root, 'posts', file);
    const { data } = matter(await fs.readFile(filename, 'utf8'));
    if (data.category !== 'photos') continue;
    const errors = photoRecordErrors(data);
    if (errors.length) throw new Error(`${file}：${errors.join('，')}`);
    records.set(data.photoHash, { filename, url: data.coverImage });
  }
  return records;
}

export async function verifyPhoto(url, expectedHash, downloadHash = verifyImageViaSsh) {
  if (!isPicuiImage(url)) throw new Error('图片地址不在本账号允许的 PICUI 路径内，原图已保留。');
  if (await downloadHash(url) !== expectedHash) {
    throw new Error('图床原图与本地图片的 SHA-256 不一致，已停止删除原图。');
  }
}

async function removeOriginal(filename, inputDirectory, hash, record, url) {
  const actual = await fs.realpath(filename);
  const relative = path.relative(await fs.realpath(inputDirectory), actual);
  if (relative.startsWith('..') || path.isAbsolute(relative) || (await fs.lstat(filename)).isSymbolicLink()) {
    throw new Error('图片路径发生变化，已停止删除。');
  }
  const data = matter(await fs.readFile(record, 'utf8')).data;
  if (data.category !== 'photos' || data.photoHash !== hash || data.coverImage !== url) {
    throw new Error('照片 MD 未正确保存或已被修改，原图已保留。');
  }
  if (hashPhoto(await fs.readFile(filename)) !== hash) {
    throw new Error('发布期间本地图片被修改，原图已保留。');
  }
  await fs.unlink(filename);
}

function postName(hash) {
  // Letter-only slugs follow this repository's article filename convention.
  return `photo-${[...hash.slice(0, 24)].map((digit) => String.fromCharCode(97 + parseInt(digit, 16))).join('')}.md`;
}

export async function publishPhotos({
  root = projectDirectory, client, metadataReader, verifyImage = verifyPhoto,
  writePost = writeNewPost, date, location, log = console.log,
} = {}) {
  root = path.resolve(root);
  const inputDirectory = path.join(root, 'photo');
  const journalDirectory = path.join(root, '.photo-publish');
  const journalFile = path.join(journalDirectory, 'uploads.json');
  const release = await lock(path.join(journalDirectory, 'lock'));
  let metadataTool;
  try {
    const files = await photoFiles(inputDirectory);
    const unsupported = files.find((filename) => !imageMimeTypes[path.extname(filename).toLowerCase()]);
    if (unsupported) throw new Error(`暂不支持 ${path.basename(unsupported)}，请先导出为 JPG、PNG、WebP、GIF 或 AVIF。`);
    const records = await publishedRecords(root);
    const journal = await readJson(journalFile, { version: 1, images: {} });
    if (journal.version !== 1 || !journal.images) throw new Error('照片发布记录格式无效。');
    const result = { uploaded: 0, reused: 0, created: 0, deleted: 0 };
    let inventory;
    const api = () => (client ||= createPicuiClient());
    async function remoteImage(checksum) {
      if (!inventory) {
        inventory = new Map();
        for (let page = 1; ; page += 1) {
          const response = await api().images(page);
          if (!Array.isArray(response?.data) || !Number.isInteger(response.last_page) || response.last_page < 1) {
            throw new Error('PICUI 图片列表无效，已停止发布以避免重复上传。');
          }
          for (const image of response.data) if (image.md5 && image.links?.url) inventory.set(image.md5, image);
          if (page >= response.last_page) break;
        }
      }
      return inventory.get(checksum);
    }

    for (const filename of files) {
      const bytes = await fs.readFile(filename);
      if (!bytes.length) throw new Error(`${path.basename(filename)} 为空，原图已保留。`);
      checkImageSize(bytes.length);
      log(`处理 ${path.basename(filename)}（${(bytes.length / 1024 / 1024).toFixed(2)} MiB）。`);
      const hash = hashPhoto(bytes);
      const checksum = md5(bytes);
      const existing = records.get(hash);
      if (existing) {
        await verifyImage(existing.url, hash);
        await removeOriginal(filename, inputDirectory, hash, existing.filename, existing.url);
        result.reused += 1;
        result.deleted += 1;
        log(`${path.basename(filename)}：已发布，复用已有 MD，删除本地重复图片。`);
        continue;
      }

      const target = path.join(root, 'posts', postName(hash));
      if (!metadataReader) metadataTool ||= createMetadataReader();
      const tags = await (metadataReader || metadataTool.read)(filename);
      const metadata = photoMetadata(filename, tags, { date, location });
      let url = journal.images[hash]?.url;
      if (!url) {
        log('检查图床中是否已有相同图片…');
        const remote = await remoteImage(checksum);
        if (remote) {
          url = imageLink(remote);
          result.reused += 1;
        } else {
          log('正在上传到 PICUI…');
          const response = await api().upload(filename, bytes);
          url = imageLink(response);
          result.uploaded += 1;
          inventory.set(checksum, { ...response, md5: checksum });
        }
        journal.images[hash] = { url };
        await writeJson(journalFile, journal);
      } else { result.reused += 1; }
      log('核对外链原图 SHA-256…');
      await verifyImage(url, hash);

      const { title, coverWidth, coverHeight } = metadata;
      const data = {
        title, category: 'photos', date: metadata.date,
        ...(metadata.location ? { location: metadata.location } : {}),
        tags: ['Photo'], coverImage: url,
        ...(coverWidth ? { coverWidth, coverHeight } : {}),
        photoHash: hash, photoMd5: checksum,
      };
      const content = matter.stringify('', data, { flowLevel: 1, lineWidth: -1, noRefs: true });
      await writePost(target, content, journalDirectory);
      records.set(hash, { filename: target, url });
      result.created += 1;
      await removeOriginal(filename, inputDirectory, hash, target, url);
      result.deleted += 1;
      log(`${path.basename(filename)} → posts/${path.basename(target)}，已验证并删除本地图片。`);
    }
    log(`照片发布完成：上传 ${result.uploaded}，复用 ${result.reused}，生成 MD ${result.created}，删除本地图片 ${result.deleted}。`);
    return result;
  } finally { try { await metadataTool?.close(); } finally { await release(); } }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  if (args.includes('--help')) {
    console.log('将图片放入 photo/，运行 npm run photos:publish。成功保存 MD 后删除原图。\n可选：--date=YYYY-MM-DD（补充或修正日期）、--location=地点。');
  } else if (args.some((arg) => !arg.startsWith('--date=') && !arg.startsWith('--location='))) {
    console.error('用法：npm run photos:publish -- [--date=YYYY-MM-DD] [--location=地点]');
    process.exitCode = 1;
  } else {
    nextEnv.loadEnvConfig(projectDirectory, false, { info() {}, error() {} });
    publishPhotos({
      date: args.find((arg) => arg.startsWith('--date='))?.slice(7),
      location: args.find((arg) => arg.startsWith('--location='))?.slice(11),
    }).catch((error) => { console.error(error.message); process.exitCode = 1; });
  }
}
