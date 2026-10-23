import { PostList } from '@/components';
import { siteConfig } from '@/config/site';
import { parsePostDate } from '@/lib/post-display.mjs';
import { getAllPosts } from '@/lib/posts';
import { ArchiveHeader } from './components';
import './index.css';

export const metadata = {
  title: `归档 | ${siteConfig.name}`,
  description: `${siteConfig.name} 的全部文章。`,
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

export default function Archive() {
  const posts = getAllPosts();
  const yearGroups = groupPostsByYear(posts);

  return (
    <div className="archive-view">
      <ArchiveHeader total={posts.length} />
      {yearGroups.length > 0 ? (
        yearGroups.map(([year, yearPosts]) => (
          <PostList key={year} title={`${year} · ${yearPosts.length} 篇`} posts={yearPosts} shortDate />
        ))
      ) : (
        <p className="archive-view-empty">暂无文章。</p>
      )}
    </div>
  );
}
