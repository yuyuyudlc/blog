import Link from 'next/link';
import { FrameNodes } from '@/components/frame';
import { TatamiRoom } from '@/components/tatami-room';
import { siteConfig } from '@/config/site';

export default function CategoryRoomHeader({ category, count = 0 }) {
  return (
    <section className="category-room-header framed-section">
      <FrameNodes positions={['top-left', 'top-right', 'bottom-left', 'bottom-right']} />
      <TatamiRoom activeSlug={category.slug} variant="mini" />
      <div className="category-room-body">
        <div className="hero-kicker">
          <span className="hero-kicker-dot" aria-hidden="true"></span>
          <span>ROOM {category.numeral}</span>
        </div>
        <div className="category-room-title-row">
          <h1 className="category-room-title">{category.label}</h1>
          <span className="category-room-count">
            {String(count).padStart(2, '0')} 篇
          </span>
        </div>
        <nav className="category-room-links" aria-label="切换房间">
          <Link href="/">← 全部</Link>
          {siteConfig.categories.map((item) => (
            <Link
              key={item.slug}
              href={`/category/${item.slug}`}
              data-active={item.slug === category.slug || undefined}
            >
              {item.numeral} {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </section>
  );
}
