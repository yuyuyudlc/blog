import Link from 'next/link';
import { FrameNodes } from '@/components/frame';
import RandomPostButton from '@/components/random-post-button';
import { TatamiRoom } from '@/components/tatami-room';
import { siteConfig } from '@/config/site';
import { formatMonthDay } from '@/lib/post-display.mjs';

export default function HomeHero({ latestPost, stats = {}, totalPosts = 0, slugs = [] }) {
  const latestHref = latestPost ? `/posts/${latestPost.slug}` : '#archive';
  const lastUpdated = latestPost ? formatMonthDay(latestPost.date) : '—';

  return (
    <section className="hero-section framed-section">
      <FrameNodes positions={['top-left', 'top-right', 'bottom-left', 'bottom-right']} />

      <div className="hero-copy">
        <div className="hero-kicker">
          <span className="hero-kicker-dot" aria-hidden="true"></span>
          <span>{siteConfig.heroKicker}</span>
        </div>

        <h1 className="hero-title">
          在无数次的
          <br />
          试错中<span className="hero-title-accent">抵达彼端</span>
        </h1>

        <p className="hero-lead">{siteConfig.heroLead}</p>

        <div className="hero-buttons">
          <Link href={latestHref} className="btn btn-primary">
            <span>阅读最新一篇</span>
            <kbd>↵</kbd>
          </Link>
          <RandomPostButton slugs={slugs} className="btn" label="再来一次" />
        </div>

        <div className="hero-stats">
          <div>
            <strong className="hero-stat-value">{totalPosts}</strong>
            <span>篇日志</span>
          </div>
          <div>
            <strong className="hero-stat-value">{siteConfig.categories.length}</strong>
            <span>个房间</span>
          </div>
          <div>
            <strong className="hero-stat-value">{lastUpdated}</strong>
            <span>最后更新</span>
          </div>
        </div>
      </div>

      <div className="hero-room-panel">
        <div className="hero-room-stage">
          <span className="hero-blueprint-line hero-blueprint-line-top" aria-hidden="true"></span>
          <span className="hero-blueprint-line hero-blueprint-line-right" aria-hidden="true"></span>
          <span className="hero-blueprint-line hero-blueprint-line-bottom" aria-hidden="true"></span>
          <span className="hero-blueprint-line hero-blueprint-line-left" aria-hidden="true"></span>
          <TatamiRoom stats={stats} variant="full" />
        </div>
      </div>

      <span className="junction-node hero-t-junction-top" aria-hidden="true"></span>
      <span className="junction-node hero-t-junction" aria-hidden="true"></span>
    </section>
  );
}
