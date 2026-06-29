import { notFound } from 'next/navigation';
import HomeHero from '@/components/home-hero';
import { DividerSlash } from '@/components/frame';
import { PostGrid } from '@/components/post-card';
import { siteConfig } from '@/config/site';
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
    description: `${category.label} entries from ${siteConfig.name}.`,
  };
}

export default async function CategoryPage({ params }) {
  const { category: categorySlug } = await params;
  const category = filterCategories.find((item) => item.slug === categorySlug);

  if (!category) {
    notFound();
  }

  const posts = getAllPosts().filter((post) => post.category === category.label);

  return (
    <div id="home-view">
      <HomeHero />
      <DividerSlash />
      <PostGrid posts={posts} activeCategory={category.label} />
    </div>
  );
}
