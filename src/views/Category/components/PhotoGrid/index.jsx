import Image from 'next/image';
import Link from 'next/link';
import { formatIsoDate } from '@/lib/post-display.mjs';
import './index.css';

/**
 * Contact sheet: square, cropped thumbnails in a grid wider than the
 * text column. The date only appears on hover.
 */
export default function PhotoGrid({ photos = [] }) {
  if (photos.length === 0) {
    return <p className="photo-grid-empty">暂无照片。</p>;
  }

  return (
    <ol className="photo-grid wide">
      {photos.map((photo, index) => {
        const isoDate = formatIsoDate(photo.date);

        return (
          <li key={photo.slug}>
            <Link href={`/posts/${photo.slug}`} className="photo-grid-item" aria-label={photo.title}>
              {photo.coverImage ? (
                <Image
                  className="photo-grid-image"
                  src={photo.coverImage}
                  alt={photo.coverAlt || photo.title}
                  fill
                  loading={index < 4 ? 'eager' : 'lazy'}
                  sizes="(max-width: 640px) 50vw, (max-width: 900px) 33vw, 270px"
                />
              ) : (
                <span className="photo-grid-missing">{photo.title}</span>
              )}
              <time className="photo-grid-date" dateTime={isoDate}>
                {isoDate}
              </time>
            </Link>
          </li>
        );
      })}
    </ol>
  );
}
