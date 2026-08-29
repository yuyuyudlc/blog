const DEFAULT_REPO = 'yuyuyudlc/blog';
const DEFAULT_REPO_ID = 'R_kgDOTI2hng';

export function getGiscusConfig(env = process.env) {
  const repo = env.NEXT_PUBLIC_GISCUS_REPO?.trim() || DEFAULT_REPO;
  const repoId = env.NEXT_PUBLIC_GISCUS_REPO_ID?.trim() || DEFAULT_REPO_ID;
  const category = env.NEXT_PUBLIC_GISCUS_CATEGORY?.trim() || '';
  const categoryId = env.NEXT_PUBLIC_GISCUS_CATEGORY_ID?.trim() || '';

  return {
    repo,
    repoId,
    category,
    categoryId,
    enabled: Boolean(repo && repoId && category && categoryId),
    discussionsUrl: `https://github.com/${repo}/discussions`,
  };
}
