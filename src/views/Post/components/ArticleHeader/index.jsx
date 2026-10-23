import Link from 'next/link';
import { formatIsoDate, formatPostDate, formatReadingTime } from '@/lib/post-display.mjs';
import './index.css';

export default function ArticleHeader({ post, category }) {
  return (
    <header className="article-header">
      <h1 className="article-header-title">{post.title}</h1>
      <p className="article-header-meta meta">
        <time dateTime={formatIsoDate(post.date)}>{formatPostDate(post.date)}</time>
        {category ? (
          <Link href={`/category/${category.slug}`} className="article-header-room">
            {category.label}
          </Link>
        ) : (
          <span>{post.category}</span>
        )}
        <span>{formatReadingTime(post.readingTime)}</span>
      </p>
    </header>
  );
}
