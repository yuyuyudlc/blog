import { notFound } from 'next/navigation';
import ArticleBackLink from '@/components/article-back-link';
import ArticleCodeCopy from '@/components/article-code-copy';
import ArticleImagePreview from '@/components/article-image-preview';
import ArticleMetaSidebar from '@/components/article-meta-sidebar';
import { FrameNodes } from '@/components/frame';
import GiscusComments from '@/components/giscus-comments';
import PostLoopNav from '@/components/post-loop-nav';
import { siteConfig } from '@/config/site';
import { getGiscusConfig } from '@/lib/giscus-config.mjs';
import {
  getAdjacentPosts,
  getAllPosts,
  getCategoryByLabel,
  getCategoryStats,
  getPostBySlug,
} from '@/lib/posts';

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

  const allPosts = getAllPosts();
  const stats = getCategoryStats(allPosts);
  const categoryInfo = getCategoryByLabel(post.category);
  const categoryCount = categoryInfo ? stats[categoryInfo.slug] ?? 0 : 0;
  const { newer, older } = getAdjacentPosts(slug, allPosts);
  const slugs = allPosts.map((item) => item.slug);
  const commentsConfig = getGiscusConfig();

  return (
    <div id="post-view">
      <div className="post-detail-layout framed-section">
        <FrameNodes positions={['top-left', 'top-right', 'bottom-left', 'bottom-right']} />

        <ArticleMetaSidebar
          post={post}
          categoryInfo={categoryInfo}
          categoryCount={categoryCount}
        />

        <main className="post-main">
          <ArticleBackLink
            category={post.category}
            categoryInfo={categoryInfo}
          />

          <header className="post-header">
            <h1 className="post-title-main">{post.title}</h1>
            <span className="junction-node post-header-node" aria-hidden="true"></span>
          </header>

          <section
            className="post-content"
            dangerouslySetInnerHTML={{ __html: post.contentHtml }}
          />
          <ArticleCodeCopy />
          <ArticleImagePreview />

          <PostLoopNav older={older} newer={newer} slugs={slugs} />

          <GiscusComments config={commentsConfig} />
        </main>

        <span className="junction-node post-sidebar-t-junction-top" aria-hidden="true"></span>
        <span className="junction-node post-sidebar-t-junction" aria-hidden="true"></span>
      </div>
    </div>
  );
}
