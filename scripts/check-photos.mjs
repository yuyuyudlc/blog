import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import matter from 'gray-matter';
import { photoRecordErrors } from './lib/photo-records.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));

async function localFiles(directory) {
  let entries;
  try { entries = await fs.readdir(directory, { withFileTypes: true }); } catch (error) {
    if (error.code === 'ENOENT') return [];
    throw error;
  }
  const result = [];
  for (const entry of entries) {
    if (entry.name === '.gitkeep') continue;
    const filename = path.join(directory, entry.name);
    if (entry.isDirectory()) result.push(...await localFiles(filename));
    else result.push(filename);
  }
  return result;
}

export async function checkPhotos({ directory = root, staged = false } = {}) {
  const errors = [];
  const inspect = (filename, content) => {
    const { data } = matter(content);
    if (data.category === 'photos') {
      for (const error of photoRecordErrors(data)) errors.push(`${filename}：${error}`);
    }
  };
  if (staged) {
    const result = spawnSync('git', ['diff', '--cached', '--name-only', '--diff-filter=ACMR', '-z'], { cwd: directory, encoding: 'utf8' });
    if (result.status !== 0) throw new Error('无法检查 Git 暂存区。');
    for (const name of result.stdout.split('\0').filter(Boolean)) {
      if (/^(photo|public\/photos)\//.test(name) && !name.endsWith('/.gitkeep')) {
        errors.push(`${name}：原图不能提交，请先发布照片，再更新暂存区。`);
      }
      if (name.startsWith('posts/') && name.endsWith('.md')) {
        const file = spawnSync('git', ['show', `:${name}`], { cwd: directory, encoding: 'utf8' });
        if (file.status !== 0) throw new Error(`无法读取暂存的 ${name}。`);
        inspect(name, file.stdout);
      }
    }
  } else {
    for (const folder of ['photo', 'public/photos']) {
      if ((await localFiles(path.join(directory, folder))).length) errors.push(`${folder}/ 尚有原图，请先运行 npm run photos:publish。`);
    }
    let names = [];
    try { names = await fs.readdir(path.join(directory, 'posts')); } catch (error) { if (error.code !== 'ENOENT') throw error; }
    for (const name of names.filter((name) => name.endsWith('.md'))) {
      inspect(`posts/${name}`, await fs.readFile(path.join(directory, 'posts', name), 'utf8'));
    }
  }
  if (errors.length) throw new Error(errors.join('\n'));
  return true;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  checkPhotos({ staged: process.argv.includes('--staged') }).then(() => {
    console.log('照片发布检查通过。');
  }).catch((error) => { console.error(error.message); process.exitCode = 1; });
}
