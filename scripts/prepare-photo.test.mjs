import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import sharp from 'sharp';
import { ExifTool } from 'exiftool-vendored';
import { preparePhoto } from './prepare-photo.mjs';
import { hashPhoto } from './publish-photos.mjs';
import { createPicuiClient } from './lib/picui.mjs';

async function fixture(t) {
  const base = await fs.mkdtemp(path.join(os.tmpdir(), 'blog-prepare-test-'));
  t.after(async () => {
    const actual = await fs.realpath(base);
    assert.equal(path.dirname(actual), await fs.realpath(os.tmpdir()));
    assert.ok(path.basename(actual).startsWith('blog-prepare-test-'));
    await fs.rm(actual, { recursive: true, force: true });
  });
  const root = path.join(base, 'repo');
  const archiveDirectory = path.join(base, 'archive');
  await fs.mkdir(path.join(root, 'photo'), { recursive: true });
  const filename = 'photo/example.jpg';
  const input = path.join(root, filename);
  await sharp({ create: { width: 800, height: 600, channels: 3, background: '#334455' } }).jpeg({ quality: 100 }).toFile(input);
  return { root, archiveDirectory, filename, input };
}

test('web copy keeps ratio and capture EXIF while the outside backup retains exact original bytes', async (t) => {
  const f = await fixture(t);
  const tool = new ExifTool({ maxProcs: 1 });
  try {
    await tool.write(f.input, { DateTimeOriginal: '2024:07:11 21:30:00' }, { writeArgs: ['-overwrite_original'] });
    const originalHash = hashPhoto(await fs.readFile(f.input));
    const result = await preparePhoto({ ...f, maxEdge: 400, log() {} });
    assert.equal(result.width, 400);
    assert.equal(result.height, 300);
    assert.equal(hashPhoto(await fs.readFile(result.backup)), originalHash);
    assert.equal(result.originalHash, originalHash);
    assert.notEqual(result.publishHash, originalHash);
    const tags = await tool.read(f.input);
    assert.equal(tags.DateTimeOriginal.year, 2024);
    assert.equal(tags.DateTimeOriginal.month, 7);
    assert.equal(tags.DateTimeOriginal.day, 11);
  } finally { await tool.end(); }
});

test('same-size option does not resize and an existing different backup is never overwritten', async (t) => {
  const f = await fixture(t);
  await fs.mkdir(f.archiveDirectory);
  const previous = path.join(f.archiveDirectory, 'example.jpg');
  await fs.writeFile(previous, 'keep previous backup');
  const original = await fs.readFile(f.input);
  const result = await preparePhoto({ ...f, maxEdge: 0, log() {} });
  assert.equal(result.width, 800);
  assert.equal(result.height, 600);
  assert.notEqual(result.backup, previous);
  assert.deepEqual(await fs.readFile(result.backup), original);
  assert.equal(await fs.readFile(previous, 'utf8'), 'keep previous backup');
});

test('an impossible target size leaves the input unchanged', async (t) => {
  const f = await fixture(t);
  const before = await fs.readFile(f.input);
  await assert.rejects(preparePhoto({ ...f, maxBytes: 1, log() {} }), /超过大小限制/);
  assert.deepEqual(await fs.readFile(f.input), before);
});

test('oversized uploads fail before contacting PICUI', async () => {
  const old = process.env.PICUI_MAX_FILE_MB;
  process.env.PICUI_MAX_FILE_MB = '20';
  let called = false;
  const client = createPicuiClient({ token: 'test', fetchImpl() { called = true; throw new Error('should not send'); } });
  try {
    await assert.rejects(client.upload('large.jpg', Buffer.alloc(20 * 1024 * 1024 + 1)), /上传上限/);
    assert.equal(called, false);
  } finally {
    if (old === undefined) delete process.env.PICUI_MAX_FILE_MB;
    else process.env.PICUI_MAX_FILE_MB = old;
  }
});
