import { notFound } from 'next/navigation';
import { Pagination, PostList } from '@/components';
import { siteConfig } from '@/config/site';
import { isPhotoCategory } from '@/lib/categories';
import { paginatePosts } from '@/lib/post-pagination.mjs';
import { getAllPosts, getCategoryBySlug } from '@/lib/posts';
import { PhotoGrid, RoomHeader } from './components';
import './index.css';

// 6 rows of the 4-column grid
const PHOTOS_PER_PAGE = 24;

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

  const isPhotos = isPhotoCategory(category);
  const posts = getAllPosts().filter((post) => post.category === category.label);
  const pageValue = Array.isArray(query?.page) ? query.page[0] : query?.page;
  const page = paginatePosts(posts, pageValue, isPhotos ? PHOTOS_PER_PAGE : undefined);

  return (
    <div className="category-view">
      <RoomHeader category={category} count={posts.length} />
      {isPhotos ? <PhotoGrid photos={page.posts} /> : <PostList posts={page.posts} />}
      <Pagination
        currentPage={page.currentPage}
        totalPages={page.totalPages}
        basePath={`/category/${category.slug}`}
      />
    </div>
  );
}
