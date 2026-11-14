import Link from 'next/link';
import './index.css';

/**
 * One line of the index: the title, and the date set quietly at the end.
 */
export default function PostRow({ post, shortDate = false }) {
  return (
    <li className="post-row">
      <Link href={`/posts/${post.slug}`} className="post-row-link">
        <span className="post-row-title">{post.title}</span>
        <time className="post-row-date meta" dateTime={post.date}>
          {shortDate ? post.date.slice(5) : post.date}
        </time>
      </Link>
    </li>
  );
}
