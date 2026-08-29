import Link from 'next/link';

function pageHref(basePath, page) {
  return `${basePath}?page=${page}#archive`;
}

export default function PostPagination({ currentPage, totalPages, totalPosts, basePath }) {
  const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <nav className="post-pagination" aria-label="文章分页">
      <p className="post-pagination-summary">
        共 {totalPosts} 篇 <span>/</span> 第 {currentPage} / {totalPages} 页
      </p>

      <div className="post-pagination-links">
        {currentPage > 1 && (
          <Link className="post-page-link post-page-direction" href={pageHref(basePath, currentPage - 1)}>
            ← 上一页
          </Link>
        )}

        {pageNumbers.map((page) => (
          <Link
            key={page}
            className="post-page-link"
            href={pageHref(basePath, page)}
            aria-current={page === currentPage ? 'page' : undefined}
          >
            {page}
          </Link>
        ))}

        {currentPage < totalPages && (
          <Link className="post-page-link post-page-direction" href={pageHref(basePath, currentPage + 1)}>
            下一页 →
          </Link>
        )}
      </div>
    </nav>
  );
}
