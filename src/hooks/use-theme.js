'use client';

import { useCallback, useEffect, useState } from 'react';
import { siteConfig } from '@/config/site';

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
      font-size: 0.78rem;
      font-weight: 500;
      padding: 7px 14px;
      border-radius: 3px;
      z-index: 200;
      transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      pointer-events: none;
    `;
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.style.transform = 'translateX(-50%) translateY(0)';

  window.setTimeout(() => {
    toast.style.transform = 'translateX(-50%) translateY(100px)';
  }, 1800);
}

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
    showFlashNotification(newTheme === 'dark' ? '已切换到深色主题' : '已切换到浅色主题');
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [setTheme, theme]);

  return { theme, setTheme, toggleTheme };
}
