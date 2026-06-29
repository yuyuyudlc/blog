'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { postCategoryBySlug } from '@/config/post-categories';
import { siteConfig } from '@/config/site';

function SunIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
  );
}

function showFlashNotification(message) {
  let toast = document.getElementById(siteConfig.toastId);

  if (!toast) {
    toast = document.createElement('div');
    toast.id = siteConfig.toastId;
    toast.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%) translateY(100px);
      background-color: var(--accent-color);
      color: #fff;
      font-family: var(--font-mono);
      font-size: 0.8rem;
      font-weight: 500;
      padding: 8px 16px;
      border-radius: 4px;
      z-index: 200;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      pointer-events: none;
    `;
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.style.transform = 'translateX(-50%) translateY(0)';

  window.setTimeout(() => {
    toast.style.transform = 'translateX(-50%) translateY(100px)';
  }, 2000);
}

function ThemeToggle({ theme, onToggle }) {
  return (
    <button id="theme-toggle" onClick={onToggle} className="btn-icon" aria-label="Toggle dark/light theme" title="Toggle theme (T)">
      {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}

export default function SiteHeaderControls() {
  const pathname = usePathname();
  const [theme, setThemeState] = useState('dark');
  const isHome = pathname === '/';
  const activeCategory = isHome
    ? 'all'
    : pathname.startsWith('/category/')
      ? pathname.split('/')[2]
      : pathname.startsWith('/posts/')
        ? postCategoryBySlug[pathname.split('/')[2]] || ''
        : '';

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setThemeState(document.documentElement.getAttribute('data-theme') || 'dark');
    });

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, []);

  const setTheme = useCallback((newTheme) => {
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem(siteConfig.themeStorageKey, newTheme);
    setThemeState(newTheme);
    showFlashNotification(newTheme === 'dark' ? 'Dark Mode Active' : 'Light Mode Active');
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [setTheme, theme]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      const activeElement = document.activeElement;
      const isInputActive =
        activeElement &&
        (activeElement.tagName === 'INPUT' ||
          activeElement.tagName === 'TEXTAREA' ||
          activeElement.isContentEditable);

      if (isInputActive) return;

      const key = event.key.toLowerCase();

      if (key === 't') {
        event.preventDefault();
        toggleTheme();
      }

    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleTheme]);

  return (
    <>
      <nav className="site-nav" aria-label="Main navigation">
        {siteConfig.categories.map((category) => (
          <Link
            key={category.slug}
            href={category.slug === 'all' ? '/#archive' : `/category/${category.slug}#archive`}
            className={`nav-link category-tab category-tab-${category.slug} ${activeCategory === category.slug ? 'active' : ''}`}
          >
            {category.label}
          </Link>
        ))}
      </nav>

      <div className="nav-actions">
        <ThemeToggle theme={theme} onToggle={toggleTheme} />
      </div>
    </>
  );
}
