import Link from 'next/link';
import { siteConfig } from '@/config/site';
import './index.css';

/**
 * The 4.5-tatami floor plan as a fine line drawing. Each mat is a
 * category; the half mat in the middle is the fifth room. Laid out in
 * the auspicious pattern where no four corners ever meet.
 */
export default function TatamiPlan({ stats = {}, activeSlug = '' }) {
  return (
    <nav className="tatami-plan" aria-label="文章分类">
      {siteConfig.categories.map((category) => {
        const count = stats[category.slug] ?? 0;
        const isActive = activeSlug === category.slug;

        return (
          <Link
            key={category.slug}
            href={`/category/${category.slug}`}
            className={`tatami-plan-mat tatami-plan-mat-${category.mat}`}
            data-active={isActive || undefined}
            data-empty={count === 0 || undefined}
            aria-current={isActive ? 'page' : undefined}
            aria-label={`${category.label}，${count} 篇`}
          >
            <span className="tatami-plan-numeral">{category.numeral}</span>
            {category.orient !== 'square' && (
              <span className="tatami-plan-label">{category.label}</span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
