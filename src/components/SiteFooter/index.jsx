import { siteConfig } from '@/config/site';
import './index.css';

export default function SiteFooter() {
  return (
    <footer className="site-footer meta">
      <span>{siteConfig.copyright}</span>
    </footer>
  );
}
