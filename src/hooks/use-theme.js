'use client';

import { useCallback, useEffect, useState } from 'react';
import { siteConfig } from '@/config/site';

/**
 * Manages the document's `data-theme` attribute (`light` | `dark`)
 * and persists user preference to localStorage.
 */
export function useTheme() {
  const [theme, setThemeState] = useState('dark');

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
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [setTheme, theme]);

  return { theme, setTheme, toggleTheme };
}
