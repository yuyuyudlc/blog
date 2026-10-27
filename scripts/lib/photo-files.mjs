import fs from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

export async function readJson(filename, fallback) {
  try { return JSON.parse(await fs.readFile(filename, 'utf8')); } catch (error) {
    if (error.code === 'ENOENT') return fallback;
    throw new Error('照片发布记录损坏，请先检查 .photo-publish/uploads.json。');
  }
}

export async function writeJson(filename, data) {
  await fs.mkdir(path.dirname(filename), { recursive: true });
  const temporary = `${filename}.${randomUUID()}.tmp`;
  try {
    const handle = await fs.open(temporary, 'wx');
    try { await handle.writeFile(`${JSON.stringify(data, null, 2)}\n`, 'utf8'); await handle.sync(); }
    finally { await handle.close(); }
    await fs.rename(temporary, filename);
  } finally { await fs.unlink(temporary).catch(() => {}); }
}

export async function lock(filename) {
  await fs.mkdir(path.dirname(filename), { recursive: true });
  try {
    const handle = await fs.open(filename, 'wx');
    await handle.writeFile(String(process.pid));
    return async () => { await handle.close(); await fs.unlink(filename).catch(() => {}); };
  } catch (error) {
    if (error.code !== 'EEXIST') throw error;
    const pid = Number(await fs.readFile(filename, 'utf8'));
    if (Number.isInteger(pid) && pid > 0) {
      try { process.kill(pid, 0); } catch (check) {
        if (check.code === 'ESRCH') { await fs.unlink(filename); return lock(filename); }
      }
    }
    throw new Error('另一个照片发布任务正在运行，请等待完成。');
  }
}

export async function writeNewPost(filename, content, journalDirectory) {
  await fs.mkdir(path.dirname(filename), { recursive: true });
  const temporary = path.join(journalDirectory, `${randomUUID()}.md.tmp`);
  try {
    const handle = await fs.open(temporary, 'wx');
    try { await handle.writeFile(content, 'utf8'); await handle.sync(); }
    finally { await handle.close(); }
    // A hard link makes a fully flushed record visible atomically without overwriting a file.
    await fs.link(temporary, filename);
  } finally { await fs.unlink(temporary).catch(() => {}); }
}
