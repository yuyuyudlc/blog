import Link from 'next/link';
import RandomPostButton from '@/components/random-post-button';

export default function PostLoopNav({ older, newer, slugs = [] }) {
  return (
    <nav className="post-loop-nav" aria-label="平行世界文章导航">
      {older ? (
        <Link href={`/posts/${older.slug}`} className="post-loop-cell">
          <span className="post-loop-kicker">← 上一个四叠半</span>
          <span className="post-loop-title">{older.title}</span>
        </Link>
      ) : (
        <Link href="/" className="post-loop-cell">
          <span className="post-loop-kicker">← 最初的房间</span>
          <span className="post-loop-title">返回四叠半首页</span>
        </Link>
      )}

      {newer ? (
        <Link href={`/posts/${newer.slug}`} className="post-loop-cell">
          <span className="post-loop-kicker">本次循环结束 · 下一个 →</span>
          <span className="post-loop-title">{newer.title}</span>
        </Link>
      ) : (
        <RandomPostButton slugs={slugs} className="post-loop-cell" showKbd={false}>
          <span className="post-loop-kicker">本次循环结束 · 再来一次 →</span>
          <span className="post-loop-title">随机穿越到另一个四叠半</span>
        </RandomPostButton>
      )}
    </nav>
  );
}
