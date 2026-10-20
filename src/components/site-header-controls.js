'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useMemo } from 'react';
import { siteConfig } from '@/config/site';
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';
import { useRandomPostNavigation } from '@/hooks/use-random-post';
import { useTheme } from '@/hooks/use-theme';

function SunIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
  );
}

function ThemeToggle({ theme, onToggle }) {
  const nextThemeLabel = theme === 'dark' ? '切换到浅色主题' : '切换到深色主题';

  return (
    <button
      id="theme-toggle"
      type="button"
      onClick={onToggle}
      className="btn-icon"
      aria-label={nextThemeLabel}
      title={`${nextThemeLabel}（T）`}
    >
      {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}

export default function SiteHeaderControls({ slugs = [] }) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const goRandom = useRandomPostNavigation(slugs);

  const shortcuts = useMemo(
    () => ({
      t: toggleTheme,
      r: goRandom,
      h: () => {
        if (pathname !== '/') {
          router.push('/');
        }
      },
    }),
    [goRandom, pathname, router, toggleTheme],
  );

  useKeyboardShortcuts(shortcuts);

  const isNavItemActive = (href) => {
    if (href === '/') {
      return (
        pathname === '/' ||
        pathname.startsWith('/posts/') ||
        pathname.startsWith('/category/')
      );
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      <nav className="site-nav" aria-label="主导航">
        {siteConfig.nav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`nav-link ${isNavItemActive(item.href) ? 'active' : ''}`.trim()}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="nav-actions">
        <button
          type="button"
          onClick={goRandom}
          className="nav-random-btn"
          title="随机穿越到一篇日志（R）"
          aria-label="随机阅读一篇日志"
        >
          <span className="nav-random-label">随机</span>
          <kbd>R</kbd>
        </button>
        <span className="nav-sep" aria-hidden="true"></span>
        <ThemeToggle theme={theme} onToggle={toggleTheme} />
      </div>
    </>
  );
}
