import Link from 'next/link';
import './index.css';

function LoopLink({ label, target }) {
  return (
    <li>
      <Link href={`/posts/${target.post.slug}`} className="loop-nav-link">
        <span className="loop-nav-label meta">{label}</span>
        <span className="loop-nav-title">{target.post.title}</span>
      </Link>
    </li>
  );
}

export default function LoopNav({ older, newer, isPhoto = false, backHref = '/' }) {
  const unit = isPhoto ? '张' : '篇';

  return (
    <nav className={isPhoto ? 'loop-nav loop-nav-photo' : 'loop-nav'} aria-label={isPhoto ? '照片导航' : '文章导航'}>
      {older ? (
        <ul>
          <LoopLink label={older.wrapped ? `回到最新一${unit}` : `上一${unit}`} target={older} />
          <LoopLink label={newer.wrapped ? `回到最早一${unit}` : `下一${unit}`} target={newer} />
        </ul>
      ) : (
        <p className="meta">
          {`目前只有这一${unit}。`}
          <Link href={backHref} className="text-link">{isPhoto ? '返回全部照片' : '回到首页'}</Link>
        </p>
      )}
    </nav>
  );
}
