import { notFound } from 'next/navigation';
import { Pagination, PostList } from '@/components';
import { siteConfig } from '@/config/site';
import { paginatePosts } from '@/lib/post-pagination.mjs';
import { getAllPosts, getCategoryBySlug } from '@/lib/posts';
import { RoomHeader } from './components';
import './index.css';

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
    description: `${siteConfig.name} · ${category.label}分类下的文章。`,
  };
}

export default async function Category({ params, searchParams }) {
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
    <div className="category-view">
      <RoomHeader category={category} count={posts.length} />
      <PostList posts={page.posts} />
      <Pagination
        currentPage={page.currentPage}
        totalPages={page.totalPages}
        basePath={`/category/${category.slug}`}
      />
    </div>
  );
}
