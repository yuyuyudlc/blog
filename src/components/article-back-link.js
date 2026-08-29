import Link from 'next/link';

export default function ArticleBackLink() {
  return (
    <Link href="/" className="post-back-btn">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M19 12H5m7 7-7-7 7-7" />
      </svg>
      返回文章列表
      <kbd>H</kbd>
    </Link>
  );
}
