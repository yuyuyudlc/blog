import Link from 'next/link';
import { FrameNodes } from '@/components/frame';
import SiteHeaderControls from '@/components/site-header-controls';
import { TatamiMark } from '@/components/tatami-motif';
import { siteConfig } from '@/config/site';
import { getAllPosts } from '@/lib/posts';

function SiteHeader({ slugs }) {
  return (
    <header className="site-header">
      <Link href="/" className="logo-group" aria-label={`${siteConfig.name} 首页`}>
        <TatamiMark />
        <span className="wordmark">{siteConfig.name}</span>
      </Link>

      <SiteHeaderControls slugs={slugs} />

      <FrameNodes positions={['bottom-left', 'bottom-right']} />
    </header>
  );
}

function SiteFooter() {
  return (
    <footer className="site-footer framed-section">
      <FrameNodes positions={['top-left', 'top-right']} />
      <div className="footer-brand">
        <TatamiMark />
        <span>{siteConfig.copyright}</span>
      </div>
      <div className="footer-nav">
        <Link href="/">日志</Link>
        <span>·</span>
        <Link href="/archive">归档</Link>
        <span>·</span>
        <a href="#top">返回顶部 ↑</a>
      </div>
    </footer>
  );
}

export default function SiteShell({ children }) {
  const slugs = getAllPosts().map((post) => post.slug);

  return (
    <>
      <SiteHeader slugs={slugs} />
      <div className="site-content">{children}</div>
      <SiteFooter />
    </>
  );
}
