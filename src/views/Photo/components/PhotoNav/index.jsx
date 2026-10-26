import Link from 'next/link';
import './index.css';

const LABELS = {
  older: { step: '上一张', wrapped: '回到最新一张' },
  newer: { step: '下一张', wrapped: '回到最早一张' },
};

function PhotoLink({ direction, target }) {
  const label = LABELS[direction];

  return (
    <li>
      <Link href={`/posts/${target.post.slug}`} className="photo-nav-link">
        <span className="photo-nav-label meta">
          {target.wrapped ? label.wrapped : label.step}
        </span>
        <span className="photo-nav-title">{target.post.title}</span>
      </Link>
    </li>
  );
}

/**
 * Older / newer photo navigation. Loops within the photos only.
 */
export default function PhotoNav({ older, newer, backHref }) {
  return (
    <nav className="photo-nav" aria-label="照片导航">
      {older || newer ? (
        <ul>
          {older && <PhotoLink direction="older" target={older} />}
          {newer && <PhotoLink direction="newer" target={newer} />}
        </ul>
      ) : (
        <p className="meta">
          目前只有这一张。<Link href={backHref} className="text-link">返回全部照片</Link>
        </p>
      )}
    </nav>
  );
}
