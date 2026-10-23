import { Pagination, PostList } from '@/components';
import { paginatePosts } from '@/lib/post-pagination.mjs';
import { getAllPosts, getCategoryStats } from '@/lib/posts';
import { Intro, Rooms } from './components';
import './index.css';

export default async function Home({ searchParams }) {
  const params = await searchParams;
  const pageValue = Array.isArray(params?.page) ? params.page[0] : params?.page;
  const allPosts = getAllPosts();
  const page = paginatePosts(allPosts, pageValue);
  const isFirstPage = page.currentPage === 1;

  return (
    <div className="home-view">
      {isFirstPage && <Intro />}
      <PostList
        title={isFirstPage ? '最近文章' : `文章 · 第 ${page.currentPage} 页`}
        posts={page.posts}
        action={isFirstPage ? { href: '/archive', label: '全部归档 →' } : null}
        emptyText="还没有文章。"
      />
      <Pagination currentPage={page.currentPage} totalPages={page.totalPages} basePath="/" />
      {isFirstPage && <Rooms stats={getCategoryStats(allPosts)} />}
    </div>
  );
}
