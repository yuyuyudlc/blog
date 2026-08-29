import Link from 'next/link';
import SiteHeaderControls from '@/components/site-header-controls';
import { TatamiMark } from '@/components/tatami-motif';
import { siteConfig } from '@/config/site';

function SiteHeader() {
  return (
    <header className="site-header">
      <Link href="/" className="logo-group" aria-label={`${siteConfig.name} 首页`}>
        <TatamiMark />
        <span className="wordmark">{siteConfig.name}</span>
      </Link>

      <SiteHeaderControls />

      <div className="junction-node bottom-left"></div>
      <div className="junction-node bottom-right"></div>
    </header>
  );
}

function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-brand">
        <TatamiMark className="footer-tatami-mark" />
        <span>{siteConfig.copyright}</span>
      </div>
      <div className="footer-nav">
        <Link href="/">文章列表</Link>
        <span>/</span>
        <a href="#top">返回顶部</a>
      </div>
    </footer>
  );
}

export default function SiteShell({ children }) {
  return (
    <>
      <SiteHeader />
      <div className="site-content">{children}</div>
      <SiteFooter />
    </>
  );
}
