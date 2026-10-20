import { DividerSlash, FrameNodes } from '@/components/frame';
import { PostRow } from '@/components/post-list';
import { siteConfig } from '@/config/site';
import { parsePostDate } from '@/lib/post-display.mjs';
import { getAllPosts } from '@/lib/posts';

export const metadata = {
  title: `归档 | ${siteConfig.name}`,
  description: `${siteConfig.name} 的全部开发日志归档。`,
};

function groupPostsByYear(posts) {
  const groups = new Map();

  posts.forEach((post) => {
    const parsed = parsePostDate(post.date);
    const year = parsed ? String(parsed.getUTCFullYear()) : '其他';
    if (!groups.has(year)) {
      groups.set(year, []);
    }
    groups.get(year).push(post);
  });

  return Array.from(groups.entries());
}

export default function ArchivePage() {
  const posts = getAllPosts();
  const yearGroups = groupPostsByYear(posts);

  return (
    <div id="archive-view">
      <header className="archive-header framed-section">
        <FrameNodes positions={['top-left', 'top-right', 'bottom-left', 'bottom-right']} />
        <div className="hero-kicker">
          <span className="hero-kicker-dot" aria-hidden="true"></span>
          <span>№ 4½ — ARCHIVE</span>
        </div>
        <h1>归档</h1>
        <p>共 {posts.length} 篇开发日志，按年份排列。</p>
      </header>

      <DividerSlash />

      <main className="framed-section">
        <FrameNodes positions={['top-left', 'top-right', 'bottom-left', 'bottom-right']} />
        {yearGroups.length > 0 ? (
          yearGroups.map(([year, yearPosts]) => (
            <section key={year} className="archive-year-group">
              <div className="archive-year-label">
                <span>{year}</span>
                <span className="archive-year-count">
                  {String(yearPosts.length).padStart(2, '0')} 篇
                </span>
              </div>
              <div className="archive-year-posts">
                {yearPosts.map((post) => (
                  <PostRow key={post.slug} post={post} />
                ))}
              </div>
            </section>
          ))
        ) : (
          <div className="post-list-empty">
            <h2>暂无归档</h2>
            <p>这里还在等待新的开发日志。</p>
          </div>
        )}
      </main>
    </div>
  );
}
