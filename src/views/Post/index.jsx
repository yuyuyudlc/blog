import { notFound } from 'next/navigation';
import { LoopNav } from '@/components';
import { siteConfig } from '@/config/site';
import { getGiscusConfig } from '@/lib/giscus-config.mjs';
import { isPhotoCategory } from '@/lib/categories';
import { estimateReadingTime, renderMarkdown } from '@/lib/markdown';
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
  const entry = getPostBySlug(slug);

  if (!entry) {
    return {
      title: siteConfig.title,
    };
  }

  const { post } = entry;
  return {
    title: `${post.title} | ${siteConfig.name}`,
    description: post.summary,
  };
}

export default async function Post({ params }) {
  const { slug } = await params;
  const entry = getPostBySlug(slug);

  if (!entry) {
    notFound();
  }

  const { post, content } = entry;
  const category = getCategoryByLabel(post.category);
  const { contentHtml, headings } = renderMarkdown(content);

  if (isPhotoCategory(category)) {
    return <Photo post={post} category={category} contentHtml={contentHtml} />;
  }

  const { older, newer } = getLoopPosts(slug, getArticles());

  return (
    <article className="post-view">
      <ArticleHeader post={post} category={category} readingTime={estimateReadingTime(content)} />
      <Toc headings={headings} />
      <ArticleBody html={contentHtml} />

      {post.tags.length > 0 && (
        <p className="post-view-tags meta">
          {post.tags.map((tag) => (
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
