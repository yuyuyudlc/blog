import Image from 'next/image';
import Link from 'next/link';
import { photoVariantPath, photoVariantSizes } from '@/config/photo-variants.mjs';
import './index.css';

/**
 * Contact sheet: square, cropped thumbnails in a grid wider than the
 * text column. The date only appears on hover.
 */
export default function PhotoGrid({ photos }) {
  if (photos.length === 0) {
    return <p className="photo-grid-empty">暂无照片。</p>;
  }

  return (
    <ol className="photo-grid wide">
      {photos.map((photo, index) => (
        <li key={photo.slug}>
          <Link href={`/posts/${photo.slug}`} className="photo-grid-item" aria-label={photo.title}>
            <Image
              className="photo-grid-image"
              src={photoVariantPath(photo.photoHash, photoVariantSizes.thumbnail)}
              alt={photo.coverAlt}
              fill
              unoptimized
              loading={index < 4 ? 'eager' : 'lazy'}
            />
            <time className="photo-grid-date" dateTime={photo.date}>
              {photo.date}
            </time>
          </Link>
        </li>
      ))}
    </ol>
  );
}
