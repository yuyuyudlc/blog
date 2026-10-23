import Link from 'next/link';
import PostRow from '../PostRow';
import './index.css';

/**
 * A titled list of posts. `action` renders an optional `{ href, label }`
 * link underneath, e.g. "全部归档 →".
 */
export default function PostList({
  title,
  posts = [],
  shortDate = false,
  action = null,
  emptyText = '暂无文章。',
}) {
  return (
    <section className="post-list">
      {title && <h2 className="post-list-title meta">{title}</h2>}

      {posts.length > 0 ? (
        <ol className="post-list-items">
          {posts.map((post) => (
            <PostRow key={post.slug} post={post} shortDate={shortDate} />
          ))}
        </ol>
      ) : (
        <p className="post-list-empty">{emptyText}</p>
      )}

      {action && (
        <Link href={action.href} className="post-list-action meta">
          {action.label}
        </Link>
      )}
    </section>
  );
}
