import Image from 'next/image';
import Link from 'next/link';
import { FrameNodes } from '@/components/frame';
import { TatamiChip } from '@/components/tatami-motif';
import { TatamiBlueprintField } from '@/components/tatami-room';
import { siteConfig } from '@/config/site';
import { formatIsoDate } from '@/lib/post-display.mjs';
import { getCategoryByLabel, isRecentPost } from '@/lib/posts';

function FeaturedPostRow({ post }) {
  const hasCoverImage = Boolean(post.coverImage);
  const categoryInfo = getCategoryByLabel(post.category);
  const isNew = isRecentPost(post.date, 7);

  return (
    <Link href={`/posts/${post.slug}`} className="post-featured-row framed-section">
      <div className="post-featured-copy">
        <div className="post-featured-meta">
          <span className="post-featured-pin">置顶</span>
          <time dateTime={formatIsoDate(post.date)}>{formatIsoDate(post.date)}</time>
          <TatamiChip label={post.category} />
          {isNew && <span className="post-new-badge">NEW</span>}
        </div>

        <div>
          <h3 className="post-featured-title">{post.title}</h3>
          {post.summary && <p className="post-featured-summary">{post.summary}</p>}
        </div>

        <span className="post-featured-cta" aria-hidden="true">
          <span>阅读全文</span>
          <span className="post-featured-cta-arrow">→</span>
        </span>
      </div>

      <div className="post-featured-visual">
        {hasCoverImage ? (
          <div className="post-featured-cover-wrap">
            <Image
              className="post-featured-cover"
              src={post.coverImage}
              alt={post.coverAlt || `${post.title}封面`}
              fill
              sizes="(max-width: 860px) 100vw, 360px"
            />
          </div>
        ) : (
          <TatamiBlueprintField activeSlug={categoryInfo?.slug || ''} />
        )}
      </div>
    </Link>
  );
}

export function PostRow({ post }) {
  const isoDate = formatIsoDate(post.date);
  const isNew = isRecentPost(post.date, 7);

  return (
    <Link href={`/posts/${post.slug}`} className="post-row">
      <time className="post-row-date" dateTime={isoDate}>
        {isoDate}
      </time>
      <TatamiChip label={post.category} />
      <div className="post-row-main">
        <h3 className="post-row-title">
          {post.title}
          {isNew && <span className="post-new-badge">NEW</span>}
        </h3>
        {post.summary && <p className="post-row-summary">{post.summary}</p>}
      </div>
      <span className="post-row-arrow" aria-hidden="true">
        →
      </span>
    </Link>
  );
}

export function PostList({
  posts = [],
  activeCategorySlug = 'all',
  showFeatured = false,
  headingTitle = '最新日志',
}) {
  const hasFeatured = showFeatured && posts.length > 0;
  const featuredPost = hasFeatured ? posts[0] : null;
  const rowPosts = hasFeatured ? posts.slice(1) : posts;

  return (
    <main className="post-list-section framed-section" id="archive">
      <FrameNodes positions={['top-left', 'top-right', 'bottom-left', 'bottom-right']} />
      <header className="post-list-header">
        <h2 className="post-list-header-title">{headingTitle}</h2>
        <span className="post-list-rule" aria-hidden="true"></span>
        <nav className="post-list-filters" aria-label="按分类筛选">
          <Link
            href="/#archive"
            className="post-filter-chip"
            data-active={activeCategorySlug === 'all' || undefined}
          >
            全部
          </Link>
          {siteConfig.categories.map((category) => (
            <Link
              key={category.slug}
              href={`/category/${category.slug}#archive`}
              className="post-filter-chip"
              data-active={activeCategorySlug === category.slug || undefined}
            >
              {category.label}
            </Link>
          ))}
        </nav>
      </header>

      {posts.length > 0 ? (
        <>
          {featuredPost && <FeaturedPostRow post={featuredPost} />}
          {rowPosts.map((post) => (
            <PostRow key={post.slug} post={post} />
          ))}
        </>
      ) : (
        <div className="post-list-empty">
          <h2>暂无日志</h2>
          <p>这个房间还在等待新的记录。</p>
        </div>
      )}
    </main>
  );
}
