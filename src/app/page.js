import { DividerSlash } from '@/components/frame';
import HomeHero from '@/components/home-hero';
import { PostList } from '@/components/post-list';
import PostPagination from '@/components/post-pagination';
import { paginatePosts } from '@/lib/post-pagination.mjs';
import { getAllPosts, getCategoryStats } from '@/lib/posts';

export default async function Home({ searchParams }) {
  const params = await searchParams;
  const pageValue = Array.isArray(params?.page) ? params.page[0] : params?.page;
  const allPosts = getAllPosts();
  const stats = getCategoryStats(allPosts);
  const slugs = allPosts.map((post) => post.slug);
  const page = paginatePosts(allPosts, pageValue);

  return (
    <div id="home-view" className="home-page-view">
      <HomeHero
        latestPost={allPosts[0] || null}
        stats={stats}
        totalPosts={allPosts.length}
        slugs={slugs}
      />
      <DividerSlash />
      <PostList
        posts={page.posts}
        activeCategorySlug="all"
        showFeatured={page.currentPage === 1}
      />
      <PostPagination
        currentPage={page.currentPage}
        totalPages={page.totalPages}
        totalPosts={page.totalPosts}
        basePath="/"
      />
    </div>
  );
}
