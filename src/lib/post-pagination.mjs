export const POSTS_PER_PAGE = 12;

export function normalizePostPage(value, totalPages) {
  const parsedPage = Number.parseInt(String(value ?? ''), 10);
  if (!Number.isFinite(parsedPage)) return 1;
  return Math.min(Math.max(parsedPage, 1), totalPages);
}

export function paginatePosts(posts, value) {
  const totalPosts = posts.length;
  const totalPages = Math.max(1, Math.ceil(totalPosts / POSTS_PER_PAGE));
  const currentPage = normalizePostPage(value, totalPages);
  const start = (currentPage - 1) * POSTS_PER_PAGE;

  return {
    currentPage,
    totalPages,
    totalPosts,
    posts: posts.slice(start, start + POSTS_PER_PAGE),
  };
}
