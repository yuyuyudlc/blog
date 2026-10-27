import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import nextEnv from '@next/env';
import { createPicuiClient, imageLink, imageMimeTypes } from './lib/picui.mjs';

const projectDirectory = fileURLToPath(new URL('../', import.meta.url));

function usage() {
  console.log(`PICUI 图片上传

用法：
  npm run image:upload -- --check
  npm run image:upload -- "照片路径.jpg" ["另一张照片.png"]
  npm run image:upload -- --json "照片路径.jpg"

在 .env.local 中设置 PICUI_TOKEN，或通过进程环境变量提供。
上传的图片公开可读；成功后输出图片外链和 Markdown。
--json 仅输出 JSON，适合其他工具调用。
`);
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    usage();
    return;
  }

  const flags = args.filter((arg) => arg.startsWith('--'));
  if (flags.some((flag) => !['--check', '--json'].includes(flag))) {
    throw new Error('未知选项，使用 --help 查看用法。');
  }
  const files = args.filter((arg) => !arg.startsWith('--'));
  const checkOnly = flags.includes('--check');
  const jsonOutput = flags.includes('--json');
  if ((checkOnly && files.length > 0) || (!checkOnly && files.length === 0)) {
    throw new Error('--check 只验证账号；上传时请提供图片路径。');
  }

  nextEnv.loadEnvConfig(projectDirectory, false, { info() {}, error() {} });
  const token = process.env.PICUI_TOKEN?.trim();
  if (!token) throw new Error('请先在 .env.local 中设置 PICUI_TOKEN。');
  const client = createPicuiClient({ token });

  if (checkOnly) {
    const profile = await client.profile();
    const result = { authenticated: true, imageCount: profile.image_num };
    console.log(jsonOutput ? JSON.stringify(result) : `PICUI 连接成功，账号内已有 ${profile.image_num} 张图片。`);
    return;
  }

  // Validate every local file before creating any remote uploads.
  const images = [];
  for (const file of files) {
    const filename = path.resolve(file);
    const mimeType = imageMimeTypes[path.extname(filename).toLowerCase()];
    if (!mimeType) throw new Error('支持上传 JPG、PNG、WebP、GIF 和 AVIF 图片。');
    let info;
    try {
      info = await stat(filename);
    } catch {
      throw new Error(`找不到图片：${file}`);
    }
    if (!info.isFile() || info.size === 0) throw new Error(`图片文件为空或不是文件：${file}`);
    images.push({ filename, mimeType });
  }

  // Upload sequentially; never retry uploads automatically and create duplicates.
  for (const image of images) {
    const file = await readFile(image.filename);
    const data = await client.upload(image.filename, file);
    const url = imageLink(data);
    const alt = path.parse(image.filename).name.replace(/[\[\]\\\r\n]/g, ' ');
    const result = { filename: path.basename(image.filename), url, markdown: `![${alt}](<${url}>)` };
    if (jsonOutput) {
      console.log(JSON.stringify(result));
    } else {
      console.log(`${result.filename}\n${result.url}\n${result.markdown}\ncoverImage: ${JSON.stringify(result.url)}\n`);
    }
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
