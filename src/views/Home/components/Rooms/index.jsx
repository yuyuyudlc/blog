import Link from 'next/link';
import { TatamiPlan } from '@/components';
import { siteConfig } from '@/config/site';
import { getCategoryUnit } from '@/lib/categories';
import './index.css';

/**
 * Categories, drawn as the mats of one 4.5-tatami floor plan, with a
 * plain list beside it for reading.
 */
export default function Rooms({ stats }) {
  return (
    <section className="home-rooms">
      <h2 className="home-rooms-title meta">分类</h2>
      <div className="home-rooms-body">
        <div className="home-rooms-plan">
          <TatamiPlan stats={stats} />
        </div>
        <ul className="home-rooms-list">
          {siteConfig.categories.map((category) => (
            <li key={category.slug}>
              <Link href={`/category/${category.slug}`} className="home-rooms-link">
                <span className="home-rooms-label">{category.label}</span>
                <span className="home-rooms-count meta">{stats[category.slug] ?? 0} {getCategoryUnit(category)}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
