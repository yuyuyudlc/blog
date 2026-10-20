import Link from 'next/link';
import ArticleToc from '@/components/article-toc';
import { TatamiRoom } from '@/components/tatami-room';
import { formatIsoDate, formatReadingTime } from '@/lib/post-display.mjs';

function MetaItem({ label, wide = false, children }) {
  return (
    <div className={`meta-item ${wide ? 'meta-item-wide' : ''}`.trim()}>
      <span className="meta-label">{label}</span>
      {children}
    </div>
  );
}

export default function ArticleMetaSidebar({ post, categoryInfo, categoryCount = 0 }) {
  const isoDate = formatIsoDate(post.date);
  const readingLabel = formatReadingTime(post.readingTime);

  return (
    <aside className="post-meta-sidebar">
      <div className="post-meta-sidebar-inner">
        <div className="sidebar-room-card">
          <TatamiRoom activeSlug={categoryInfo?.slug || ''} variant="mini" />
          <div className="sidebar-room-info">
            {categoryInfo ? (
              <Link href={`/category/${categoryInfo.slug}`} className="sidebar-room-link">
                {categoryInfo.numeral} · {post.category}
              </Link>
            ) : (
              <span className="sidebar-room-link">{post.category}</span>
            )}
            <span className="sidebar-room-sub">
              {String(categoryCount).padStart(2, '0')} 篇
            </span>
          </div>
        </div>

        <MetaItem label="发布于">
          <time className="meta-val meta-val-mono" dateTime={isoDate}>
            {isoDate}
          </time>
        </MetaItem>

        <MetaItem label="阅读">
          <span className="meta-val">{readingLabel}</span>
        </MetaItem>

        {Array.isArray(post.tags) && post.tags.length > 0 && (
          <MetaItem label="标签" wide>
            <div className="meta-tags">
              {post.tags.map((tag) => (
                <span key={tag} className="meta-tag">
                  {tag}
                </span>
              ))}
            </div>
          </MetaItem>
        )}

        <ArticleToc headings={post.headings || []} />
      </div>
    </aside>
  );
}
