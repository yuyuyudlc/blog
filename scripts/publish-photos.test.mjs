import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { deflateSync } from 'node:zlib';
import { test } from 'node:test';
import matter from 'gray-matter';
import { ExifTool } from 'exiftool-vendored';
import { publishPhotos, hashPhoto, verifyPhoto } from './publish-photos.mjs';
import { photoMetadata } from './lib/photo-metadata.mjs';
import { checkPhotos } from './check-photos.mjs';

const base = 'https://cdn.imgos.cn/vip/19936/';
const metadata = async () => ({ DateTimeOriginal: '2026:10:20 17:30:00', City: '京都', ImageWidth: 900, ImageHeight: 600 });
const noopVerify = async () => {};
async function fixture(t) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'blog-publish-test-'));
  t.after(async () => {
    const actual = await fs.realpath(root);
    assert.equal(path.dirname(actual), await fs.realpath(os.tmpdir()));
    assert.ok(path.basename(actual).startsWith('blog-publish-test-'));
    await fs.rm(actual, { recursive: true, force: true });
  });
  await fs.mkdir(path.join(root, 'photo'));
  await fs.mkdir(path.join(root, 'posts'));
  return root;
}
function mockClient(initial = []) {
  const records = [...initial];
  const calls = { uploads: 0, lists: 0 };
  return {
    records, calls,
    async images(page) {
      calls.lists += 1;
      return { data: records.slice((page - 1) * 2, page * 2), last_page: Math.max(1, Math.ceil(records.length / 2)) };
    },
    async upload(_, bytes) {
      calls.uploads += 1;
      const result = { key: `test-${calls.uploads}`, md5: createHash('md5').update(bytes).digest('hex'), links: { url: `${base}test-${calls.uploads}.png` } };
      records.push(result);
      return result;
    },
  };
}
const run = (root, client, options = {}) => publishPhotos({ root, client, metadataReader: metadata, verifyImage: noopVerify, log() {}, ...options });
async function records(root) {
  return Promise.all((await fs.readdir(path.join(root, 'posts'))).map(async (name) => {
    const raw = await fs.readFile(path.join(root, 'posts', name), 'utf8');
    return { name, raw, ...matter(raw) };
  }));
}

test('publish generates complete MD using filename and EXIF, then deletes the verified source', async (t) => {
  const root = await fixture(t);
  const source = path.join(root, 'photo/鸭川傍晚.png');
  await fs.writeFile(source, 'image-a');
  const client = mockClient();
  const result = await run(root, client);
  const [record] = await records(root);
  assert.equal(record.data.title, '鸭川傍晚');
  assert.equal(record.data.location, '京都');
  assert.equal(record.data.date, '2026-10-20');
  assert.equal(record.data.photoHash, hashPhoto(Buffer.from('image-a')));
  assert.equal(record.data.coverImage, `${base}test-1.png`);
  assert.match(record.name, /^[a-z-]+\.md$/);
  assert.match(record.raw, /tags: \[Photo\]/);
  await assert.rejects(fs.access(source), { code: 'ENOENT' });
  assert.deepEqual(result, { uploaded: 1, reused: 0, created: 1, deleted: 1 });
});

test('renamed copies reuse SHA-256, preserve edited MD, and do not re-read metadata or upload', async (t) => {
  const root = await fixture(t);
  const bytes = Buffer.from('same-image');
  await fs.writeFile(path.join(root, 'photo/first.png'), bytes);
  const client = mockClient();
  await run(root, client);
  const [record] = await records(root);
  const revised = matter.stringify('我保留的正文。\n', { ...record.data, title: '手动修改后的标题' }, { flowLevel: 1 });
  await fs.writeFile(path.join(root, 'posts', record.name), revised);
  await fs.writeFile(path.join(root, 'photo/renamed.png'), bytes);
  await run(root, client, { metadataReader() { throw new Error('should not read metadata'); } });
  assert.equal(client.calls.uploads, 1);
  assert.equal(client.calls.lists, 1);
  assert.equal((await records(root)).length, 1);
  assert.equal(await fs.readFile(path.join(root, 'posts', record.name), 'utf8'), revised);
  assert.deepEqual(await fs.readdir(path.join(root, 'photo')), []);
});

test('same filename with different content creates separate records', async (t) => {
  const root = await fixture(t);
  const client = mockClient();
  for (const bytes of ['first-image', 'second-image']) {
    await fs.writeFile(path.join(root, 'photo/same-name.png'), bytes);
    await run(root, client);
  }
  assert.equal(client.calls.uploads, 2);
  assert.equal((await records(root)).length, 2);
});

test('cloud inventory pagination finds an existing MD5 without re-uploading', async (t) => {
  const root = await fixture(t);
  const bytes = Buffer.from('in-cloud');
  await fs.writeFile(path.join(root, 'photo/cloud.png'), bytes);
  const client = mockClient([
    { md5: 'a', links: { url: `${base}a.png` } }, { md5: 'b', links: { url: `${base}b.png` } },
    { key: 'existing', md5: createHash('md5').update(bytes).digest('hex'), links: { url: `${base}existing.png` } },
  ]);
  await run(root, client);
  assert.equal(client.calls.lists, 2);
  assert.equal(client.calls.uploads, 0);
  assert.equal((await records(root))[0].data.coverImage, `${base}existing.png`);
});

test('uncertain POST response is reconciled by MD5 before retrying', async (t) => {
  const root = await fixture(t);
  const source = path.join(root, 'photo/recover.png');
  await fs.writeFile(source, 'recover');
  const client = mockClient();
  const upload = client.upload.bind(client);
  client.upload = async (...args) => { await upload(...args); throw new Error('lost response'); };
  await assert.rejects(run(root, client), /lost response/);
  await fs.access(source);
  assert.equal((await records(root)).length, 0);
  client.upload = upload;
  await run(root, client);
  assert.equal(client.calls.uploads, 1);
  await assert.rejects(fs.access(source), { code: 'ENOENT' });
});

test('unreachable CDN keeps original and journal; retry does not upload twice', async (t) => {
  const root = await fixture(t);
  const source = path.join(root, 'photo/cdn.png');
  await fs.writeFile(source, 'cdn');
  const client = mockClient();
  await assert.rejects(run(root, client, { verifyImage() { throw new Error('CDN unavailable'); } }), /CDN unavailable/);
  await fs.access(source);
  assert.equal((await records(root)).length, 0);
  await run(root, client);
  assert.equal(client.calls.uploads, 1);
});

test('MD save failure retains source and recovers upload from journal', async (t) => {
  const root = await fixture(t);
  const source = path.join(root, 'photo/disk.png');
  await fs.writeFile(source, 'disk');
  const client = mockClient();
  await assert.rejects(run(root, client, { writePost() { throw new Error('disk full'); } }), /disk full/);
  await fs.access(source);
  await run(root, client);
  assert.equal(client.calls.uploads, 1);
});

test('a source modified during publication is never deleted', async (t) => {
  const root = await fixture(t);
  const source = path.join(root, 'photo/changed.png');
  await fs.writeFile(source, 'old');
  const client = mockClient();
  const upload = client.upload.bind(client);
  client.upload = async (...args) => { const result = await upload(...args); await fs.writeFile(source, 'new'); return result; };
  await assert.rejects(run(root, client), /被修改/);
  assert.equal(await fs.readFile(source, 'utf8'), 'new');
  assert.equal((await records(root)).length, 1);
});

test('missing capture date fails before any upload; explicit date works and location is optional', async (t) => {
  const root = await fixture(t);
  const source = path.join(root, 'photo/no-date.png');
  await fs.writeFile(source, 'no-date');
  const client = mockClient();
  await assert.rejects(run(root, client, { metadataReader: async () => ({}) }), /没有拍摄日期/);
  assert.equal(client.calls.lists, 0);
  assert.equal(client.calls.uploads, 0);
  await fs.access(source);
  await run(root, client, { metadataReader: async () => ({}), date: '2026-10-26' });
  const [record] = await records(root);
  assert.equal(record.data.date, '2026-10-26');
  assert.equal(record.data.location, undefined);
});

test('metadata uses capture calendar date, handles rotation, and rejects impossible dates', () => {
  const tags = { DateTimeOriginal: { year: 2026, month: 10, day: 20 }, GeolocationCity: 'Kyoto', GeolocationCountry: 'Japan', ImageWidth: 3000, ImageHeight: 2000, Orientation: 6 };
  const result = photoMetadata('photo.jpg', tags);
  assert.equal(result.date, '2026-10-20');
  assert.equal(result.location, 'Kyoto · Japan');
  assert.equal(result.coverWidth, 2000);
  assert.equal(result.coverHeight, 3000);
  assert.throws(() => photoMetadata('photo.jpg', tags, { date: '2026-02-30' }), /有效/);
});

test('verification requires the downloaded image to match SHA-256', async () => {
  const previous = globalThis.fetch;
  globalThis.fetch = async () => new Response(Buffer.from('wrong-image'), { headers: { 'content-type': 'image/png' } });
  try { await assert.rejects(verifyPhoto(`${base}verify.png`, hashPhoto(Buffer.from('original'))), /SHA-256 不一致/); }
  finally { globalThis.fetch = previous; }
});

test('concurrent publishing cannot upload or delete the same input twice', async (t) => {
  const root = await fixture(t);
  await fs.writeFile(path.join(root, 'photo/locked.png'), 'locked');
  const client = mockClient();
  let release;
  let started;
  const ready = new Promise((resolve) => { started = resolve; });
  client.images = async () => { started(); await new Promise((resolve) => { release = resolve; }); return { data: [], last_page: 1 }; };
  const first = run(root, client);
  await ready;
  await assert.rejects(run(root, client), /正在运行/);
  release();
  await first;
  assert.equal(client.calls.uploads, 1);
  assert.equal((await records(root)).length, 1);
});

test('staged checks reject raw images and inspect staged MD rather than working copies', async (t) => {
  const root = await fixture(t);
  const git = (...args) => {
    const result = spawnSync('git', args, { cwd: root, encoding: 'utf8' });
    assert.equal(result.status, 0, result.stderr);
    return result;
  };
  git('init', '-q');
  await fs.writeFile(path.join(root, 'photo/staged.png'), 'staged image');
  git('add', 'photo/staged.png');
  await assert.rejects(checkPhotos({ directory: root, staged: true }), /原图不能提交/);
  git('rm', '--cached', 'photo/staged.png');
  await run(root, mockClient());
  const [record] = await records(root);
  git('add', 'posts');
  await fs.writeFile(path.join(root, 'posts', record.name), matter.stringify('', { ...record.data, coverImage: 'photo/local.png' }));
  assert.equal(await checkPhotos({ directory: root, staged: true }), true);
  await assert.rejects(checkPhotos({ directory: root }), /HTTPS/);
});

test('SSH relay accepts UTF-8 Chinese filenames before validating connection settings', (t) => {
  const result = spawnSync(process.platform === 'win32' ? 'python' : 'python3', ['scripts/lib/picui-ssh.py'], {
    input: JSON.stringify({ filename: '五条坂夜晚.jpg', ssh: {} }), encoding: 'utf8', windowsHide: true,
  });
  if (result.error?.code === 'ENOENT') { t.skip('Optional Python transport is not installed'); return; }
  assert.equal(result.status, 1);
  assert.match(result.stderr, /ValueError/);
  assert.doesNotMatch(result.stderr, /UnicodeDecodeError/);
});

function png() {
  const crc = (buffer) => {
    let value = 0xffffffff;
    for (const byte of buffer) { value ^= byte; for (let bit = 0; bit < 8; bit += 1) value = (value >>> 1) ^ (value & 1 ? 0xedb88320 : 0); }
    return (value ^ 0xffffffff) >>> 0;
  };
  const chunk = (type, data) => {
    const body = Buffer.concat([Buffer.from(type), data]);
    const length = Buffer.alloc(4); length.writeUInt32BE(data.length);
    const checksum = Buffer.alloc(4); checksum.writeUInt32BE(crc(body));
    return Buffer.concat([length, body, checksum]);
  };
  const header = Buffer.alloc(13); header.writeUInt32BE(16); header.writeUInt32BE(12, 4); header[8] = 8; header[9] = 2;
  const raw = Buffer.concat(Array.from({ length: 12 }, () => Buffer.concat([Buffer.from([0]), Buffer.alloc(16 * 3, 220)])));
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', header), chunk('IDAT', deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]);
}

test('real EXIF capture date and offline GPS city extraction', async (t) => {
  const root = await fixture(t);
  const source = path.join(root, 'photo/exif.png');
  await fs.writeFile(source, png());
  const tool = new ExifTool({ maxProcs: 1, geolocation: true });
  try {
    await tool.write(source, { DateTimeOriginal: '2026:10:20 17:30:00', GPSLatitude: 35.0116, GPSLongitude: 135.7681 }, { writeArgs: ['-overwrite_original'] });
    const tags = await tool.read(source);
    const result = photoMetadata(source, tags);
    assert.equal(result.date, '2026-10-20');
    assert.ok(tags.GeolocationCity);
    assert.ok(result.location);
  } finally { await tool.end(); }
});
