import Link from 'next/link';
import './index.css';

function pageHref(basePath, page) {
  return page === 1 ? basePath : `${basePath}?page=${page}`;
}

/**
 * "← 上一页 · 2 / 3 · 下一页 →". Renders nothing when everything fits on one page.
 */
export default function Pagination({ currentPage, totalPages, basePath }) {
  if (totalPages <= 1) return null;

  return (
    <nav className="pagination meta" aria-label="文章分页">
      {currentPage > 1 ? (
        <Link href={pageHref(basePath, currentPage - 1)}>← 上一页</Link>
      ) : (
        <span aria-hidden="true">← 上一页</span>
      )}
      <span>
        {currentPage} / {totalPages}
      </span>
      {currentPage < totalPages ? (
        <Link href={pageHref(basePath, currentPage + 1)}>下一页 →</Link>
      ) : (
        <span aria-hidden="true">下一页 →</span>
      )}
    </nav>
  );
}
