import Image from 'next/image';
import { siteConfig } from '@/config/site';
import { formatPostDate, formatReadingTime } from '@/lib/post-display.mjs';

function MetaItem({ label, children }) {
  return (
    <div className="meta-item">
      <span className="meta-label">{label}</span>
      {children}
    </div>
  );
}

export default function ArticleMetaSidebar({ post }) {
  return (
    <aside className="post-meta-sidebar">
      <div className="post-meta-sidebar-inner">
        <MetaItem label="分类">
          <span className="meta-val">{post.category}</span>
        </MetaItem>

        <MetaItem label="发布于">
          <span className="meta-val">{formatPostDate(post.date)}</span>
        </MetaItem>

        <MetaItem label="作者">
          <div className="meta-val author">
            <span className="meta-avatar" aria-hidden="true">
              <Image
                className="meta-avatar-image"
                src={post.authorAvatar || siteConfig.authorAvatar}
                alt=""
                fill
                sizes="256px"
              />
            </span>
            <span>{post.author || siteConfig.author}</span>
          </div>
        </MetaItem>

        <MetaItem label="阅读时长">
          <span className="meta-val">{formatReadingTime(post.readingTime)}</span>
        </MetaItem>

        <MetaItem label="标签">
          <div className="meta-tags">
            {post.tags.map((tag) => (
              <span key={tag} className="meta-tag">
                {tag}
              </span>
            ))}
          </div>
        </MetaItem>
      </div>
    </aside>
  );
}
