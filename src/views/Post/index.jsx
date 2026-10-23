import { notFound } from 'next/navigation';
import { siteConfig } from '@/config/site';
import { getGiscusConfig } from '@/lib/giscus-config.mjs';
import { getAllPosts, getCategoryByLabel, getLoopPosts, getPostBySlug } from '@/lib/posts';
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

  const { older, newer } = getLoopPosts(slug);
  const tags = Array.isArray(post.tags) ? post.tags : [];

  return (
    <article className="post-view">
      <ArticleHeader post={post} category={getCategoryByLabel(post.category)} />
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
