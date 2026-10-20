import { notFound } from 'next/navigation';
import CategoryRoomHeader from '@/components/category-room-header';
import { DividerSlash } from '@/components/frame';
import { PostList } from '@/components/post-list';
import PostPagination from '@/components/post-pagination';
import { siteConfig } from '@/config/site';
import { paginatePosts } from '@/lib/post-pagination.mjs';
import { getAllPosts, getCategoryBySlug } from '@/lib/posts';

export function generateStaticParams() {
  return siteConfig.categories.map((category) => ({
    category: category.slug,
  }));
}

export async function generateMetadata({ params }) {
  const { category: categorySlug } = await params;
  const category = getCategoryBySlug(categorySlug);

  if (!category) {
    return {
      title: siteConfig.title,
    };
  }

  return {
    title: `${category.label} | ${siteConfig.name}`,
    description: `${siteConfig.name} · ROOM ${category.numeral}（${category.label}）分类日志。`,
  };
}

export default async function CategoryPage({ params, searchParams }) {
  const { category: categorySlug } = await params;
  const query = await searchParams;
  const category = getCategoryBySlug(categorySlug);

  if (!category) {
    notFound();
  }

  const posts = getAllPosts().filter((post) => post.category === category.label);
  const pageValue = Array.isArray(query?.page) ? query.page[0] : query?.page;
  const page = paginatePosts(posts, pageValue);

  return (
    <div id="category-view">
      <CategoryRoomHeader category={category} count={posts.length} />
      <DividerSlash />
      <PostList
        posts={page.posts}
        activeCategorySlug={category.slug}
        showFeatured={false}
        headingTitle={`ROOM ${category.numeral} · ${category.label}`}
      />
      <PostPagination
        currentPage={page.currentPage}
        totalPages={page.totalPages}
        totalPosts={page.totalPosts}
        basePath={`/category/${categorySlug}`}
      />
    </div>
  );
}
