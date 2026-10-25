import Link from 'next/link';
import './index.css';

const LABELS = {
  older: { step: '上一篇', wrapped: '回到最新一篇' },
  newer: { step: '下一篇', wrapped: '回到最早一篇' },
};

function LoopLink({ direction, target }) {
  const label = LABELS[direction];

  return (
    <li>
      <Link href={`/posts/${target.post.slug}`} className="loop-nav-link">
        <span className="loop-nav-label meta">
          {target.wrapped ? label.wrapped : label.step}
        </span>
        <span className="loop-nav-title">{target.post.title}</span>
      </Link>
    </li>
  );
}

/**
 * Older / newer post navigation. It loops: past the oldest post it
 * returns to the newest one, and vice versa.
 */
export default function LoopNav({ older, newer }) {
  return (
    <nav className="loop-nav" aria-label="文章导航">
      {older || newer ? (
        <ul>
          {older && <LoopLink direction="older" target={older} />}
          {newer && <LoopLink direction="newer" target={newer} />}
        </ul>
      ) : (
        <p className="meta">
          目前只有这一篇。<Link href="/" className="text-link">回到首页</Link>
        </p>
      )}
    </nav>
  );
}
