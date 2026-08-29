import { notFound } from 'next/navigation';
import HomeHero from '@/components/home-hero';
import { DividerSlash } from '@/components/frame';
import { PostGrid } from '@/components/post-card';
import PostPagination from '@/components/post-pagination';
import { siteConfig } from '@/config/site';
import { paginatePosts } from '@/lib/post-pagination.mjs';
import { getAllPosts } from '@/lib/posts';

const filterCategories = siteConfig.categories.filter((category) => category.slug !== 'all');

export function generateStaticParams() {
  return filterCategories.map((category) => ({
    category: category.slug,
  }));
}

export async function generateMetadata({ params }) {
  const { category: categorySlug } = await params;
  const category = filterCategories.find((item) => item.slug === categorySlug);

  if (!category) {
    return {
      title: siteConfig.title,
    };
  }

  return {
    title: `${category.label} | ${siteConfig.name}`,
    description: `${siteConfig.name} 的${category.label}分类文章。`,
  };
}

export default async function CategoryPage({ params, searchParams }) {
  const { category: categorySlug } = await params;
  const query = await searchParams;
  const category = filterCategories.find((item) => item.slug === categorySlug);

  if (!category) {
    notFound();
  }

  const posts = getAllPosts().filter((post) => post.category === category.label);
  const pageValue = Array.isArray(query?.page) ? query.page[0] : query?.page;
  const page = paginatePosts(posts, pageValue);

  return (
    <div id="home-view">
      <HomeHero />
      <DividerSlash />
      <PostGrid posts={page.posts} activeCategory={category.label} />
      <PostPagination
        currentPage={page.currentPage}
        totalPages={page.totalPages}
        totalPosts={page.totalPosts}
        basePath={`/category/${categorySlug}`}
      />
    </div>
  );
}
