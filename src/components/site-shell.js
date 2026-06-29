import Link from 'next/link';
import SiteHeaderControls from '@/components/site-header-controls';
import { siteConfig } from '@/config/site';

function SiteHeader() {
  return (
    <header className="site-header">
      <Link href="/" className="logo-group" aria-label={`${siteConfig.name} home`}>
        <span className="wordmark">&gt;_ {siteConfig.name}</span>
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
      <div>
        <span>{siteConfig.copyright}</span>
      </div>
      <div className="footer-nav">
        <Link href="/">Journal Hub</Link>
        <span>/</span>
        <a href="#top">Back to Top</a>
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
