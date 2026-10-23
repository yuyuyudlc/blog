'use client';

import { siteConfig } from '@/config/site';
import { useCommands } from '../CommandProvider';
import './index.css';

export default function SiteFooter() {
  const { openHelp } = useCommands();

  return (
    <footer className="site-footer meta">
      <span>{siteConfig.copyright}</span>
      <button type="button" className="site-footer-help" onClick={openHelp}>
        按 <kbd>?</kbd> 查看快捷键
      </button>
    </footer>
  );
}
