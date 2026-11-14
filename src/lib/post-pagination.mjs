const POSTS_PER_PAGE = 12;

function normalizePostPage(value, totalPages) {
  const page = Array.isArray(value) ? value[0] : value;
  const parsedPage = Number.parseInt(page, 10);
  if (!Number.isFinite(parsedPage)) return 1;
  return Math.min(Math.max(parsedPage, 1), totalPages);
}

export function paginatePosts(posts, value, perPage = POSTS_PER_PAGE) {
  const totalPosts = posts.length;
  const totalPages = Math.max(1, Math.ceil(totalPosts / perPage));
  const currentPage = normalizePostPage(value, totalPages);
  const start = (currentPage - 1) * perPage;

  return {
    currentPage,
    totalPages,
    totalPosts,
    posts: posts.slice(start, start + perPage),
  };
}
