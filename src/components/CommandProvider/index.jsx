'use client';

import { usePathname, useRouter } from 'next/navigation';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { siteConfig } from '@/config/site';
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';
import { useRandomPostNavigation } from '@/hooks/use-random-post';
import { useTheme } from '@/hooks/use-theme';
import CommandPalette from '../CommandPalette';
import ShortcutHelp from '../ShortcutHelp';

const CommandContext = createContext(null);

/**
 * Exposes `{ theme, toggleTheme, goRandom, openPalette, openHelp }`.
 */
export function useCommands() {
  const context = useContext(CommandContext);
  if (!context) {
    throw new Error('useCommands must be used inside <CommandProvider>.');
  }
  return context;
}

/**
 * Moves keyboard focus through every `[data-nav-item]` on the page.
 */
function moveListFocus(step) {
  const items = Array.from(document.querySelectorAll('[data-nav-item]'));
  if (!items.length) return;

  const current = items.indexOf(document.activeElement);
  const fallback = step > 0 ? 0 : items.length - 1;
  const next = current === -1
    ? fallback
    : Math.min(Math.max(current + step, 0), items.length - 1);

  items[next].focus({ preventScroll: true });
  items[next].scrollIntoView({ block: 'nearest' });
}

function followLoop(direction) {
  document.querySelector(`[data-loop="${direction}"]`)?.click();
}

/**
 * Owns the site-wide interaction layer: theme, global shortcuts, the
 * command palette and the shortcut help dialog.
 */
export default function CommandProvider({ posts = [], children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  const slugs = useMemo(() => posts.map((post) => post.slug), [posts]);
  const goRandom = useRandomPostNavigation(slugs);

  const openPalette = useCallback(() => {
    setHelpOpen(false);
    setPaletteOpen(true);
  }, []);

  const openHelp = useCallback(() => {
    setPaletteOpen(false);
    setHelpOpen(true);
  }, []);

  const goHome = useCallback(() => {
    if (pathname !== '/') router.push('/');
  }, [pathname, router]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setHelpOpen(false);
        setPaletteOpen((open) => !open);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const shortcuts = useMemo(
    () => ({
      '/': openPalette,
      '?': openHelp,
      t: toggleTheme,
      r: goRandom,
      h: goHome,
      j: () => moveListFocus(1),
      k: () => moveListFocus(-1),
      '[': () => followLoop('older'),
      ']': () => followLoop('newer'),
    }),
    [goHome, goRandom, openHelp, openPalette, toggleTheme],
  );

  useKeyboardShortcuts(shortcuts, !paletteOpen && !helpOpen);

  const commands = useMemo(
    () => [
      { id: 'go-home', group: '跳转', label: '首页', hint: 'H', run: () => router.push('/') },
      { id: 'go-archive', group: '跳转', label: '归档', run: () => router.push('/archive') },
      ...siteConfig.categories.map((category) => ({
        id: `room-${category.slug}`,
        group: '跳转',
        label: `分类：${category.label}`,
        keywords: [category.slug, 'category', '分类'],
        run: () => router.push(`/category/${category.slug}`),
      })),
      { id: 'random', group: '命令', label: '随机一篇文章', hint: 'R', keywords: ['random'], run: goRandom },
      {
        id: 'theme',
        group: '命令',
        label: theme === 'dark' ? '切换到浅色主题' : '切换到深色主题',
        hint: 'T',
        keywords: ['theme', 'dark', 'light', '主题'],
        run: toggleTheme,
      },
      { id: 'help', group: '命令', label: '显示快捷键', hint: '?', keywords: ['help', 'shortcut'], run: openHelp },
    ],
    [goRandom, openHelp, router, theme, toggleTheme],
  );

  const value = useMemo(
    () => ({ theme, toggleTheme, goRandom, openPalette, openHelp }),
    [goRandom, openHelp, openPalette, theme, toggleTheme],
  );

  return (
    <CommandContext.Provider value={value}>
      {children}
      <CommandPalette
        open={paletteOpen}
        onOpenChange={setPaletteOpen}
        posts={posts}
        commands={commands}
      />
      <ShortcutHelp open={helpOpen} onOpenChange={setHelpOpen} />
    </CommandContext.Provider>
  );
}
