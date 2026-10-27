import path from 'node:path';
import { ExifTool } from 'exiftool-vendored';

export function validDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function captureDate(value) {
  if (!value) return undefined;
  const parts = typeof value === 'object'
    ? [value.year, value.month, value.day]
    : String(value).match(/^(\d{4})[:-](\d{2})[:-](\d{2})/)?.slice(1);
  if (!parts?.every((part) => Number.isInteger(Number(part)))) return undefined;
  const result = parts.map((part, index) => String(part).padStart(index === 0 ? 4 : 2, '0')).join('-');
  return validDate(result) ? result : undefined;
}

const text = (value) => typeof value === 'string' ? value.trim() : '';
const join = (values) => [...new Set(values.map(text).filter(Boolean))].join(' · ');

export function photoMetadata(filename, tags, { date, location } = {}) {
  if (date && !validDate(date)) throw new Error('--date 必须是有效的 YYYY-MM-DD 日期。');
  const taken = date || captureDate(tags.SubSecDateTimeOriginal) || captureDate(tags.DateTimeOriginal)
    || captureDate(tags.CreateDate) || captureDate(tags.DateCreated);
  if (!taken) throw new Error(`${path.basename(filename)} 没有拍摄日期，请用 --date=YYYY-MM-DD 补充；原图已保留。`);
  const explicit = join([tags.Location, tags.SubLocation, tags.City, tags.State, tags.Country]);
  const inferred = join([tags.GeolocationCity, tags.GeolocationRegion, tags.GeolocationCountry]);
  const place = location !== undefined ? location.trim() : explicit || inferred;
  const title = path.basename(filename, path.extname(filename));
  let width = Number(tags.ImageWidth || tags.ExifImageWidth);
  let height = Number(tags.ImageHeight || tags.ExifImageHeight);
  if ([5, 6, 7, 8].includes(Number(tags.Orientation))) [width, height] = [height, width];
  return {
    title, date: taken, location: place,
    ...(Number.isInteger(width) && width > 0 && Number.isInteger(height) && height > 0
      ? { coverWidth: width, coverHeight: height } : {}),
  };
}

export function createMetadataReader() {
  // Geolocation uses ExifTool's bundled offline city database. No GPS leaves the machine.
  const tool = new ExifTool({ maxProcs: 1, geolocation: true });
  return {
    read: (filename) => tool.read(filename),
    close: () => tool.end(),
  };
}
