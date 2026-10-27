import Image from 'next/image';
import Link from 'next/link';
import { isPicuiImage } from '@/config/images.mjs';
import { formatIsoDate, formatPostDate } from '@/lib/post-display.mjs';
import { getLoopPosts, getPhotos } from '@/lib/posts';
import { PhotoNav } from './components';
import './index.css';

/**
 * A single photo, rendered for posts in the photos category. The image is
 * shown uncropped at the largest size that fits the screen, wider than
 * the text column; clicking it opens the original file.
 */
export default function Photo({ post, category }) {
  const backHref = `/category/${category.slug}`;
  const { older, newer } = getLoopPosts(post.slug, getPhotos());
  const alt = post.coverAlt || post.title;

  return (
    <article className="photo-view">
      <Link href={backHref} className="photo-view-back meta">← {category.label}</Link>

      <div className="photo-view-stage wide">
        <figure className="photo-view-figure">
          {post.coverImage ? (
            <a href={post.coverImage} className="photo-view-original" title="查看原图">
              <Image
                className="photo-view-image"
                src={post.coverImage}
                alt={alt}
                width={post.coverWidth || 0}
                height={post.coverHeight || 0}
                sizes="(max-width: 1128px) 100vw, 1080px"
                unoptimized={isPicuiImage(post.coverImage)}
                preload
              />
            </a>
          ) : (
            <p className="photo-view-missing meta">这张照片还没有设置 coverImage。</p>
          )}

          {/* A table caption is exactly as wide as the photo above it */}
          <figcaption className="photo-view-caption">
            <h1 className="photo-view-title">{post.title}</h1>
            <p className="meta">
              <time dateTime={formatIsoDate(post.date)}>{formatPostDate(post.date)}</time>
              {post.location && <span> · {post.location}</span>}
            </p>
            {post.contentHtml?.trim() && (
              <div className="photo-view-note" dangerouslySetInnerHTML={{ __html: post.contentHtml }} />
            )}
          </figcaption>
        </figure>
      </div>

      <PhotoNav older={older} newer={newer} backHref={backHref} />
    </article>
  );
}
