const dateFormatter = new Intl.DateTimeFormat('zh-CN', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  timeZone: 'UTC',
});

export function parsePostDate(value) {
  if (value instanceof Date && !Number.isNaN(value.valueOf())) {
    return value;
  }

  if (typeof value !== 'string') return null;

  const isoMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    return new Date(Date.UTC(Number(isoMatch[1]), Number(isoMatch[2]) - 1, Number(isoMatch[3])));
  }

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.valueOf())) return null;

  return new Date(Date.UTC(parsedDate.getFullYear(), parsedDate.getMonth(), parsedDate.getDate()));
}

export function formatPostDate(value) {
  const date = parsePostDate(value);
  return date ? dateFormatter.format(date) : String(value ?? '');
}

export function formatIsoDate(value) {
  const date = parsePostDate(value);
  if (!date) return String(value ?? '');

  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatReadingTime(value) {
  const text = String(value ?? '');
  const minutes = text.match(/\d+/)?.[0];
  return minutes ? `约 ${minutes} 分钟` : text;
}
