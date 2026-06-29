import { siteConfig } from '@/config/site';

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
      <MetaItem label="Category">
        <span className="meta-val">{post.category}</span>
      </MetaItem>

      <MetaItem label="Published">
        <span className="meta-val">{post.date}</span>
      </MetaItem>

      <MetaItem label="Author">
        <div className="meta-val author">
          <div className="meta-avatar"></div>
          <span>{post.author || siteConfig.author}</span>
        </div>
      </MetaItem>

      <MetaItem label="Reading Time">
        <span className="meta-val">{post.readingTime}</span>
      </MetaItem>

      <MetaItem label="Tags">
        <div className="meta-tags">
          {post.tags.map((tag) => (
            <span key={tag} className="meta-tag">
              {tag}
            </span>
          ))}
        </div>
      </MetaItem>
    </aside>
  );
}
