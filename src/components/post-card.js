import Link from 'next/link';
import Image from 'next/image';
import { FrameNodes } from '@/components/frame';
import { OffsetSquareGrid } from '@/components/tatami-motif';
import { formatPostDate } from '@/lib/post-display.mjs';

function ArrowIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14m-7-7 7 7-7 7" />
    </svg>
  );
}

function EmptyCard() {
  return (
    <div className="post-card post-card-empty">
      <div className="junction-node bottom-left"></div>
      <div className="empty-card-mark" aria-hidden="true">
        <svg width="120" height="120" viewBox="0 0 246 246" fill="none" stroke="currentColor" strokeWidth={1.5} className="logo-svg">
          <rect width="244.624" height="244.624" x="0.623" y="0.623" rx="4"></rect>
          <path d="M91.101 91.101h63.047v63.047H91.101z"></path>
        </svg>
      </div>
      <div className="border-hatch-pattern"></div>
    </div>
  );
}

export function PostCard({ post, index }) {
  const junctionClass = index % 2 === 0 ? 'junction-node bottom-right' : 'junction-node bottom-left';

  return (
    <Link href={`/posts/${post.slug}`} className="post-card">
      <div className={junctionClass}></div>
      <div className="post-card-hover-bar" aria-hidden="true">
        阅读文章
        <ArrowIcon />
      </div>
      <div className="post-card-content">
        <div className="post-card-meta">
          <span className="post-card-category">{post.category}</span>
          <span>/</span>
          <span>{formatPostDate(post.date)}</span>
        </div>
        <h2 className="post-card-title">{post.title}</h2>
        <p className="post-card-summary">{post.summary}</p>
      </div>
      <div className="border-hatch-pattern"></div>
    </Link>
  );
}

export function PostGrid({ posts, activeCategory }) {
  return (
    <main className="blog-grid framed-section" id="archive">
      <FrameNodes />
      {posts.length > 0 ? (
        posts.map((post, index) => (
          <PostCard key={post.slug} post={post} index={index} />
        ))
      ) : (
        <div className="post-card post-card-empty-state">
          <div className="junction-node bottom-right"></div>
          <div>
            <div className="post-card-meta">
              <span className="post-card-category">{activeCategory}</span>
              <span>/</span>
              <span>暂无</span>
            </div>
            <h2 className="post-card-title">暂无文章</h2>
            <p className="post-card-summary">这个分类正在等待新的技术笔记。</p>
          </div>
          <div className="border-hatch-pattern"></div>
        </div>
      )}

      {posts.length % 2 !== 0 && <EmptyCard />}
    </main>
  );
}

function HomePostMeta({ post }) {
  return (
    <div className="home-post-meta">
      <span className="home-post-category">{post.category}</span>
      <span aria-hidden="true">/</span>
      <time dateTime={post.date}>{formatPostDate(post.date)}</time>
    </div>
  );
}

function HomeFeaturedPost({ post }) {
  const hasCoverImage = Boolean(post.coverImage);
  const fieldClassName = hasCoverImage
    ? 'home-featured-field home-featured-field-has-cover'
    : 'home-featured-field home-featured-field-fallback';

  return (
    <Link href={`/posts/${post.slug}`} className="home-featured-post">
      <div className="home-featured-copy">
        <HomePostMeta post={post} />
        <h2 className="home-featured-title">{post.title}</h2>
        <p className="home-featured-summary">{post.summary}</p>
        <span className="home-featured-link" aria-hidden="true">阅读全文 <span>→</span></span>
      </div>
      <div className={fieldClassName}>
        {hasCoverImage && (
          <Image
            className="home-featured-cover"
            src={post.coverImage}
            alt={post.coverAlt || `${post.title}封面`}
            fill
            sizes="(max-width: 767px) 100vw, 40vw"
          />
        )}
        <OffsetSquareGrid className="home-featured-grid" />
      </div>
    </Link>
  );
}

function HomePostRow({ post, index }) {
  return (
    <Link href={`/posts/${post.slug}`} className="home-post-row" style={{ '--row-index': index }}>
      <span className="junction-node home-row-junction" aria-hidden="true"></span>
      <HomePostMeta post={post} />
      <h2 className="home-post-row-title">{post.title}</h2>
      <p className="home-post-row-summary">{post.summary}</p>
    </Link>
  );
}

export function HomePostIndex({ posts }) {
  const [featuredPost, ...remainingPosts] = posts;

  return (
    <main className="home-journal framed-section" id="archive">
      <FrameNodes />
      <header className="home-journal-heading">
        <h2>四叠半 / 最新文章</h2>
        <span className="home-journal-rule" aria-hidden="true"></span>
      </header>

      {featuredPost ? (
        <>
          <HomeFeaturedPost post={featuredPost} />
          <div className="home-post-rows">
            {remainingPosts.map((post, index) => (
              <HomePostRow key={post.slug} post={post} index={index} />
            ))}
          </div>
        </>
      ) : (
        <div className="home-journal-empty">
          <HomePostMeta post={{ category: '首页', date: '暂无' }} />
          <h2>暂无文章</h2>
          <p>这里正在等待新的技术笔记。</p>
        </div>
      )}
    </main>
  );
}
