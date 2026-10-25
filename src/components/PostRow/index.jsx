import Link from 'next/link';
import { formatIsoDate } from '@/lib/post-display.mjs';
import './index.css';

/**
 * One line of the index: the title, and the date set quietly at the end.
 */
export default function PostRow({ post, shortDate = false }) {
  const isoDate = formatIsoDate(post.date);

  return (
    <li className="post-row">
      <Link href={`/posts/${post.slug}`} className="post-row-link">
        <span className="post-row-title">{post.title}</span>
        <time className="post-row-date meta" dateTime={isoDate}>
          {shortDate ? isoDate.slice(5) : isoDate}
        </time>
      </Link>
    </li>
  );
}
