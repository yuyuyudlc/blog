import Link from 'next/link';
import { isPhotoCategory } from '@/lib/categories';
import './index.css';

export default function RoomHeader({ category, count }) {
  return (
    <header className="room-header">
      <Link href="/" className="room-header-back meta">← 首页</Link>
      <h1 className="room-header-title">{category.label}</h1>
      <p className="meta">
        {count} {isPhotoCategory(category) ? '张照片' : '篇文章'}
      </p>
    </header>
  );
}
