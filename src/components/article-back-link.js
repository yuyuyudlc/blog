import Link from 'next/link';

export default function ArticleBackLink({ category, categoryInfo }) {
  return (
    <div className="post-breadcrumb">
      <nav className="post-breadcrumb-trail" aria-label="面包屑">
        <Link href="/">日志</Link>
        <span aria-hidden="true">/</span>
        {categoryInfo ? (
          <Link href={`/category/${categoryInfo.slug}`} className="post-breadcrumb-room">
            {categoryInfo.numeral} · {category}
          </Link>
        ) : (
          <span className="post-breadcrumb-room">{category}</span>
        )}
      </nav>

      <Link href="/" className="post-back-shortcut" title="返回首页（H）">
        <span>返回</span>
        <kbd>H</kbd>
      </Link>
    </div>
  );
}
