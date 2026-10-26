import { notFound } from 'next/navigation';
import { siteConfig } from '@/config/site';
import { getGiscusConfig } from '@/lib/giscus-config.mjs';
import { isPhotoCategory } from '@/lib/categories';
import {
  getAllPosts,
  getArticles,
  getCategoryByLabel,
  getLoopPosts,
  getPostBySlug,
} from '@/lib/posts';
import Photo from '@/views/Photo';
import {
  ArticleBody,
  ArticleHeader,
  CodeCopy,
  Comments,
  ImagePreview,
  LoopNav,
  Toc,
} from './components';
import './index.css';

export function generateStaticParams() {
  return getAllPosts().map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return {
      title: siteConfig.title,
    };
  }

  return {
    title: `${post.title} | ${siteConfig.name}`,
    description: post.summary,
  };
}

export default async function Post({ params }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const category = getCategoryByLabel(post.category);

  if (isPhotoCategory(category)) {
    return <Photo post={post} category={category} />;
  }

  const { older, newer } = getLoopPosts(slug, getArticles());
  const tags = Array.isArray(post.tags) ? post.tags : [];

  return (
    <article className="post-view">
      <ArticleHeader post={post} category={category} />
      <Toc headings={post.headings || []} />
      <ArticleBody html={post.contentHtml} />

      {tags.length > 0 && (
        <p className="post-view-tags meta">
          {tags.map((tag) => (
            <span key={tag}>#{tag}</span>
          ))}
        </p>
      )}

      <LoopNav older={older} newer={newer} />
      <Comments config={getGiscusConfig()} />

      <CodeCopy />
      <ImagePreview />
    </article>
  );
}
