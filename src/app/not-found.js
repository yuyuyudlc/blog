import Link from 'next/link';
import RandomPostButton from '@/components/random-post-button';
import { InfiniteRoom } from '@/components/tatami-motif';
import { getAllPosts } from '@/lib/posts';

export default function NotFound() {
  const slugs = getAllPosts().map((post) => post.slug);

  return (
    <section className="infinite-room-section">
      <InfiniteRoom layers={9} />

      <div className="infinite-room-card">
        <span className="meta-label">404</span>
        <h1>你走进了一个不存在的四叠半</h1>
        <p>这个房间没有门，但每个房间都通往另一个房间。</p>

        <div className="hero-buttons">
          <Link href="/" className="btn btn-primary">
            <span>回到最初的房间</span>
            <kbd>H</kbd>
          </Link>
          <RandomPostButton slugs={slugs} className="btn" label="随机穿越" />
        </div>
      </div>
    </section>
  );
}
