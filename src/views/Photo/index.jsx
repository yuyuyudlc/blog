import Image from 'next/image';
import Link from 'next/link';
import { LoopNav } from '@/components';
import { photoVariantPath, photoVariantSizes } from '@/config/photo-variants.mjs';
import { formatPostDate } from '@/lib/post-display.mjs';
import { getLoopPosts, getPhotos } from '@/lib/posts';
import './index.css';

/**
 * A single photo, rendered for posts in the photos category. The image is
 * shown uncropped at the largest size that fits the screen, wider than
 * the text column; clicking it opens the original file.
 */
export default function Photo({ post, category, contentHtml }) {
  const backHref = `/category/${category.slug}`;
  const { older, newer } = getLoopPosts(post.slug, getPhotos());

  return (
    <article className="photo-view">
      <Link href={backHref} className="photo-view-back meta">← {category.label}</Link>

      <div className="photo-view-stage wide">
        <figure className="photo-view-figure">
          <a href={post.coverImage} className="photo-view-original" title="查看原图">
            <Image
              className="photo-view-image"
              src={photoVariantPath(post.photoHash, photoVariantSizes.display)}
              alt={post.coverAlt}
              width={post.coverWidth || 0}
              height={post.coverHeight || 0}
              unoptimized
              preload
            />
          </a>

          {/* A table caption is exactly as wide as the photo above it */}
          <figcaption className="photo-view-caption">
            <h1 className="photo-view-title">{post.title}</h1>
            <p className="meta">
              <time dateTime={post.date}>{formatPostDate(post.date)}</time>
              {post.location && <span> · {post.location}</span>}
            </p>
            {contentHtml.trim() && (
              <div className="photo-view-note" dangerouslySetInnerHTML={{ __html: contentHtml }} />
            )}
          </figcaption>
        </figure>
      </div>

      <LoopNav older={older} newer={newer} isPhoto backHref={backHref} />
    </article>
  );
}
