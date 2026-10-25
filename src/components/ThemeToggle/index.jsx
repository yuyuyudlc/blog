'use client';

import { useTheme } from '@/hooks/use-theme';
import './index.css';

/**
 * A small half-filled circle — the moon between light and dark.
 */
export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const nextThemeLabel = theme === 'dark' ? '切换到浅色主题' : '切换到深色主题';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="theme-toggle"
      aria-label={nextThemeLabel}
      title={nextThemeLabel}
    >
      <svg viewBox="0 0 16 16" aria-hidden="true">
        <circle cx="8" cy="8" r="6.25" />
        <path d="M8 1.75a6.25 6.25 0 0 1 0 12.5Z" />
      </svg>
    </button>
  );
}
