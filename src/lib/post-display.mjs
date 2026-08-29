const dateFormatter = new Intl.DateTimeFormat('zh-CN', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  timeZone: 'UTC',
});

export function formatPostDate(value) {
  if (value instanceof Date && !Number.isNaN(value.valueOf())) {
    return dateFormatter.format(value);
  }

  if (typeof value !== 'string') return String(value ?? '');

  const isoMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  let date;

  if (isoMatch) {
    date = new Date(Date.UTC(Number(isoMatch[1]), Number(isoMatch[2]) - 1, Number(isoMatch[3])));
  } else {
    const parsedDate = new Date(value);
    date = Number.isNaN(parsedDate.valueOf())
      ? parsedDate
      : new Date(Date.UTC(parsedDate.getFullYear(), parsedDate.getMonth(), parsedDate.getDate()));
  }

  return Number.isNaN(date.valueOf()) ? value : dateFormatter.format(date);
}

export function formatReadingTime(value) {
  const text = String(value ?? '');
  const minutes = text.match(/\d+/)?.[0];
  return minutes ? `约 ${minutes} 分钟` : text;
}
