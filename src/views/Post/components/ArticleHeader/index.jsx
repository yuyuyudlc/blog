import Link from 'next/link';
import { formatPostDate } from '@/lib/post-display.mjs';
import './index.css';

export default function ArticleHeader({ post, category, readingTime }) {
  return (
    <header className="article-header">
      <h1 className="article-header-title">{post.title}</h1>
      <p className="article-header-meta meta">
        <time dateTime={post.date}>{formatPostDate(post.date)}</time>
        <Link href={`/category/${category.slug}`} className="article-header-room">
          {category.label}
        </Link>
        <span>约 {readingTime} 分钟</span>
      </p>
    </header>
  );
}
