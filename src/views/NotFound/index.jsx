import Link from 'next/link';
import { RandomPostButton } from '@/components';
import { getAllPosts } from '@/lib/posts';
import { InfiniteRoom } from './components';
import './index.css';

export default function NotFound() {
  const slugs = getAllPosts().map((post) => post.slug);

  return (
    <section className="not-found-view">
      <div className="not-found-room">
        <InfiniteRoom layers={9} />
      </div>

      <p className="meta">404</p>
      <h1 className="not-found-title">页面不存在。</h1>
      <p className="not-found-lead">你走进了一个不存在的四叠半——不过每个房间都通往另一个房间。</p>

      <p className="not-found-actions">
        <Link href="/" className="text-link">回到首页</Link>
        <RandomPostButton slugs={slugs} />
      </p>
    </section>
  );
}
