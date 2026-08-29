import { notFound } from 'next/navigation';
import ArticleBackLink from '@/components/article-back-link';
import ArticleImagePreview from '@/components/article-image-preview';
import ArticleMetaSidebar from '@/components/article-meta-sidebar';
import GiscusComments from '@/components/giscus-comments';
import { FrameNodes } from '@/components/frame';
import { getGiscusConfig } from '@/lib/giscus-config.mjs';
import { getAllPosts, getPostBySlug } from '@/lib/posts';
import { siteConfig } from '@/config/site';

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

  const commentsConfig = getGiscusConfig();

  return (
    <div id="post-view">
      <div className="post-detail-layout framed-section">
        <FrameNodes />
        <ArticleMetaSidebar post={post} />

        <main className="post-main">
          <ArticleBackLink />

          <article className="post-header">
            <h1 className="post-title-main">{post.title}</h1>
            <div className="horizontal-border-guide" style={{ marginTop: '24px' }}>
              <div className="junction-node bottom-left"></div>
            </div>
          </article>

          <section
            className="post-content"
            dangerouslySetInnerHTML={{ __html: post.contentHtml }}
          />
          <ArticleImagePreview />

          <footer className="post-article-footer">
            <div>
              <span className="post-footer-label">文章结束</span>
              <span>{siteConfig.copyright}</span>
            </div>
          </footer>

          <GiscusComments config={commentsConfig} />
        </main>
      </div>
    </div>
  );
}
