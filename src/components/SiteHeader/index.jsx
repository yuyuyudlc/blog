'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { siteConfig } from '@/config/site';
import { useCommands } from '../CommandProvider';
import TatamiMark from '../TatamiMark';
import ThemeToggle from '../ThemeToggle';
import './index.css';

function isNavItemActive(pathname, href) {
  if (href === '/') {
    return pathname === '/' || pathname.startsWith('/posts/') || pathname.startsWith('/category/');
  }
  return pathname.startsWith(href);
}

export default function SiteHeader() {
  const pathname = usePathname();
  const { openPalette } = useCommands();

  return (
    <header className="site-header">
      <Link href="/" className="site-header-name" aria-label={`${siteConfig.name} 首页`}>
        <TatamiMark />
        <span>{siteConfig.name}</span>
      </Link>

      <nav className="site-header-nav" aria-label="主导航">
        {siteConfig.nav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="site-header-link"
            aria-current={isNavItemActive(pathname, item.href) ? 'page' : undefined}
          >
            {item.label}
          </Link>
        ))}
        <button
          type="button"
          className="site-header-link"
          onClick={openPalette}
          title="搜索（⌘K 或 /）"
        >
          搜索
        </button>
        <ThemeToggle />
      </nav>
    </header>
  );
}
