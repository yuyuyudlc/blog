import Link from 'next/link';
import { siteConfig } from '@/config/site';

export function TatamiRoom({
  stats = {},
  activeSlug = '',
  variant = 'full',
  showNodes = true,
  className = '',
}) {
  const isMini = variant === 'mini';
  const RootTag = isMini ? 'div' : 'nav';

  return (
    <RootTag
      className={`tatami-room tatami-room-${variant} ${className}`.trim()}
      aria-label={isMini ? undefined : '四叠半分类房间'}
      aria-hidden={isMini ? 'true' : undefined}
    >
      {siteConfig.categories.map((category) => {
        const count = stats[category.slug] ?? 0;
        const countText = String(count).padStart(2, '0');
        const isActive = activeSlug === category.slug;
        const matClasses = `tatami-mat tatami-mat-${category.mat} tatami-mat-${category.orient}`;

        if (isMini) {
          return (
            <span
              key={category.slug}
              className={matClasses}
              data-active={isActive || undefined}
            />
          );
        }

        return (
          <Link
            key={category.slug}
            href={`/category/${category.slug}`}
            className={matClasses}
            data-active={isActive || undefined}
            data-empty={count === 0 || undefined}
            aria-label={`${category.numeral} · ${category.label}，${count} 篇`}
          >
            <span className="tatami-mat-numeral">{category.numeral}</span>
            <span className="tatami-mat-label">{category.label}</span>
            <span className="tatami-mat-count">
              {category.orient === 'square' ? countText : `${countText} 篇`}
            </span>
          </Link>
        );
      })}

      {showNodes && (
        <>
          <span className="tatami-node tatami-node-tl" aria-hidden="true"></span>
          <span className="tatami-node tatami-node-tr" aria-hidden="true"></span>
          <span className="tatami-node tatami-node-bl" aria-hidden="true"></span>
          <span className="tatami-node tatami-node-br" aria-hidden="true"></span>
        </>
      )}
    </RootTag>
  );
}

export function TatamiBlueprintField({ activeSlug = '' }) {
  return (
    <div className="tatami-blueprint-field" aria-hidden="true">
      <span className="tatami-blueprint-axis tatami-blueprint-axis-h"></span>
      <span className="tatami-blueprint-axis tatami-blueprint-axis-v"></span>
      <span className="tatami-blueprint-layer tatami-blueprint-layer-outer"></span>
      <span className="tatami-blueprint-layer tatami-blueprint-layer-mid"></span>
      <span className="tatami-blueprint-layer tatami-blueprint-layer-inner"></span>
      <TatamiRoom
        activeSlug={activeSlug}
        variant="mini"
        showNodes={true}
        className="post-featured-mini-room"
      />
    </div>
  );
}
