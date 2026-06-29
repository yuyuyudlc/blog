import Link from 'next/link';
import { FrameNodes } from '@/components/frame';

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
        Learn More
        <ArrowIcon />
      </div>
      <div>
        <div className="post-card-meta">
          <span className="post-card-category">{post.category}</span>
          <span>/</span>
          <span>{post.date}</span>
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
              <span>empty</span>
            </div>
            <h2 className="post-card-title">No entries yet</h2>
            <p className="post-card-summary">This category is ready for future notes.</p>
          </div>
          <div className="border-hatch-pattern"></div>
        </div>
      )}

      {posts.length % 2 !== 0 && <EmptyCard />}
    </main>
  );
}
