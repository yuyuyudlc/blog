import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const imageMimeTypes = {
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
  '.webp': 'image/webp', '.gif': 'image/gif', '.avif': 'image/avif',
};

export function checkImageSize(bytes) {
  const limitMb = Number(process.env.PICUI_MAX_FILE_MB || 20);
  if (!Number.isFinite(limitMb) || limitMb <= 0) throw new Error('PICUI_MAX_FILE_MB 必须为正数。');
  if (bytes > limitMb * 1024 * 1024) {
    throw new Error(`图片为 ${(bytes / 1024 / 1024).toFixed(2)} MiB，超过当前 ${limitMb} MiB 上传上限；请先运行 photos:prepare 生成发布版本，原图已保留。`);
  }
}

export function imageLink(data) {
  let url;
  try { url = new URL(data?.links?.url); } catch {
    throw new Error('PICUI 没有返回有效图片外链，请在图片管理中检查。');
  }
  if (url.protocol !== 'https:' || url.username || url.password) {
    throw new Error('PICUI 返回的图片外链不是有效的 HTTPS 地址。');
  }
  return url.href;
}

function sshRequest(input) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.env.PICUI_SSH_PYTHON || 'python', [
      fileURLToPath(new URL('./picui-ssh.py', import.meta.url)),
    ], { stdio: ['pipe', 'pipe', 'pipe'], windowsHide: true });
    let output = '';
    let errors = '';
    const timer = setTimeout(() => { child.kill(); reject(new Error('PICUI SSH 请求超时。')); }, input.upload ? 600_000 : 120_000);
    child.stdout.setEncoding('utf8').on('data', (chunk) => { output += chunk; });
    child.stderr.setEncoding('utf8').on('data', (chunk) => { errors += chunk; });
    child.once('error', () => { clearTimeout(timer); reject(new Error('无法启动 PICUI 转发工具，请检查 Python 与 paramiko。')); });
    child.stdin.on('error', () => {});
    child.once('close', (code) => {
      clearTimeout(timer);
      if (code !== 0) { reject(new Error(errors.trim() || 'PICUI SSH 转发失败。')); return; }
      try { resolve(JSON.parse(output)); } catch { reject(new Error('PICUI 转发工具返回了无效响应。')); }
    });
    child.stdin.end(JSON.stringify({
      ...input,
      ssh: {
        host: process.env.PICUI_SSH_HOST, username: process.env.PICUI_SSH_USER,
        password: process.env.PICUI_SSH_PASSWORD, fingerprint: process.env.PICUI_SSH_FINGERPRINT,
      },
    }));
  });
}

export async function verifyImageViaSsh(url) {
  const result = await sshRequest({ verifyUrl: url });
  if (result.status !== 200 || !result.contentType?.startsWith('image/') || !result.bytes) {
    throw new Error('服务器无法读取图床原图，发布副本已保留。');
  }
  return result.hash;
}

export async function downloadImageViaSsh(url) {
  const { image } = await sshRequest({ verifyUrl: url, download: true });
  return Buffer.from(image, 'base64');
}

export function createPicuiClient() {
  const token = process.env.PICUI_TOKEN?.trim();
  if (!token) throw new Error('请先在 .env.local 中设置 PICUI_TOKEN。');

  async function request(endpoint, upload) {
    const { status, body: result } = await sshRequest({ token, endpoint, upload });
    if (status === 401) throw new Error('PICUI token 无效或已过期。');
    if (status === 403) throw new Error('PICUI 拒绝请求，请检查账号的 API 权限。');
    if (status === 429) throw new Error('PICUI 请求过于频繁，请稍后再试。');
    if (status < 200 || status >= 300 || result?.status !== true) {
      throw new Error(`PICUI 操作失败（HTTP ${status}），请检查文件格式、大小及账号剩余容量。`);
    }
    return result.data;
  }
  return {
    profile: () => request('/profile'),
    images: (page) => request(`/images?page=${page}&order=newest`),
    upload(filename, bytes) {
      return request('/upload', {
        filename: path.basename(filename), bytes: bytes.toString('base64'),
        mimeType: imageMimeTypes[path.extname(filename).toLowerCase()],
      });
    },
  };
}
