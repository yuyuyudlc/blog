import HomeHero from '@/components/home-hero';
import { DividerSlash } from '@/components/frame';
import { HomePostIndex } from '@/components/post-card';
import PostPagination from '@/components/post-pagination';
import { paginatePosts } from '@/lib/post-pagination.mjs';
import { getAllPosts } from '@/lib/posts';

export default async function Home({ searchParams }) {
  const params = await searchParams;
  const pageValue = Array.isArray(params?.page) ? params.page[0] : params?.page;
  const page = paginatePosts(getAllPosts(), pageValue);

  return (
    <div id="home-view" className="home-page-view">
      <HomeHero />
      <DividerSlash />
      <HomePostIndex posts={page.posts} />
      <PostPagination
        currentPage={page.currentPage}
        totalPages={page.totalPages}
        totalPosts={page.totalPosts}
        basePath="/"
      />
    </div>
  );
}
