import { validDate } from './photo-metadata.mjs';

export function photoRecordErrors(data) {
  const errors = [];
  for (const field of ['title', 'coverImage']) {
    if (typeof data[field] !== 'string' || !data[field].trim()) errors.push(`缺少 ${field}`);
  }
  if (data.summary !== undefined && (typeof data.summary !== 'string' || !data.summary.trim())) {
    errors.push('summary 必须为非空文本');
  }
  if (!validDate(data.date)) errors.push('date 必须为带引号的 YYYY-MM-DD 字符串');
  if (!Array.isArray(data.tags) || data.tags.some((tag) => typeof tag !== 'string')) errors.push('tags 必须为数组');
  try {
    const url = new URL(data.coverImage);
    if (url.protocol !== 'https:' || url.username || url.password) throw new Error();
  } catch { errors.push('coverImage 必须为已发布的 HTTPS 图床链接'); }
  if (!/^[a-f0-9]{64}$/.test(data.photoHash || '')) errors.push('缺少有效的 SHA-256 photoHash');
  return errors;
}
