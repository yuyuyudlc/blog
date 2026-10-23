import Link from 'next/link';
import './index.css';

export default function RoomHeader({ category, count }) {
  return (
    <header className="room-header">
      <Link href="/" className="room-header-back meta">← 首页</Link>
      <h1 className="room-header-title">{category.label}</h1>
      <p className="meta">{count} 篇文章</p>
    </header>
  );
}
