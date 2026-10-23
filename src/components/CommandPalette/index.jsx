'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { useRouter } from 'next/navigation';
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import './index.css';

const MAX_POST_RESULTS = 8;
const LATEST_POST_COUNT = 5;

function normalize(value) {
  return String(value ?? '').toLowerCase();
}

/**
 * Ranks a post against the query: title hits first, then tags and
 * category, then the summary. Returns 0 when it does not match.
 */
function scorePost(post, query) {
  if (normalize(post.title).includes(query)) return 3;
  if (post.tags.some((tag) => normalize(tag).includes(query)) || normalize(post.category).includes(query)) return 2;
  if (normalize(post.summary).includes(query) || normalize(post.slug).includes(query)) return 1;
  return 0;
}

function searchPosts(posts, query) {
  if (!query) return posts.slice(0, LATEST_POST_COUNT);

  return posts
    .map((post) => ({ post, score: scorePost(post, query) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_POST_RESULTS)
    .map((entry) => entry.post);
}

function searchCommands(commands, query) {
  if (!query) return commands;

  return commands.filter((command) =>
    [command.label, ...(command.keywords || [])].some((text) => normalize(text).includes(query)),
  );
}

function groupItems(items) {
  const groups = new Map();
  items.forEach((item, index) => {
    if (!groups.has(item.group)) groups.set(item.group, []);
    groups.get(item.group).push({ ...item, index });
  });
  return Array.from(groups.entries());
}

function PaletteBody({ posts, commands, onClose }) {
  const router = useRouter();
  const listId = useId();
  const listRef = useRef(null);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);

  const items = useMemo(() => {
    const normalizedQuery = normalize(query.trim());
    const postItems = searchPosts(posts, normalizedQuery).map((post) => ({
      id: `post-${post.slug}`,
      group: normalizedQuery ? '文章' : '最近文章',
      label: post.title,
      meta: `${post.date} · ${post.category}`,
      run: () => router.push(`/posts/${post.slug}`),
    }));

    return [...postItems, ...searchCommands(commands, normalizedQuery)];
  }, [commands, posts, query, router]);

  const safeIndex = Math.min(activeIndex, Math.max(items.length - 1, 0));
  const activeItem = items[safeIndex];

  useEffect(() => {
    listRef.current
      ?.querySelector('[data-active]')
      ?.scrollIntoView({ block: 'nearest' });
  }, [safeIndex]);

  const runItem = (item) => {
    if (!item) return;
    onClose();
    item.run();
  };

  const handleKeyDown = (event) => {
    const isNext = event.key === 'ArrowDown' || (event.ctrlKey && event.key === 'n');
    const isPrev = event.key === 'ArrowUp' || (event.ctrlKey && event.key === 'p');

    if (isNext || isPrev) {
      event.preventDefault();
      if (!items.length) return;
      const step = isNext ? 1 : -1;
      setActiveIndex((safeIndex + step + items.length) % items.length);
    } else if (event.key === 'Enter' && !event.nativeEvent.isComposing) {
      event.preventDefault();
      runItem(activeItem);
    }
  };

  return (
    <>
      <div className="command-palette-search">
        <span className="command-palette-prompt" aria-hidden="true">›</span>
        <input
          className="command-palette-input"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setActiveIndex(0);
          }}
          onKeyDown={handleKeyDown}
          placeholder="搜索文章或命令…"
          role="combobox"
          aria-label="搜索文章或命令"
          aria-expanded="true"
          aria-controls={listId}
          aria-activedescendant={activeItem ? `${listId}-${activeItem.id}` : undefined}
          autoComplete="off"
          spellCheck={false}
        />
        <kbd>Esc</kbd>
      </div>

      <div className="command-palette-list" id={listId} role="listbox" ref={listRef} aria-label="结果">
        {items.length === 0 && <p className="command-palette-empty">没有匹配的结果。</p>}

        {groupItems(items).map(([group, groupItemsList]) => (
          <div key={group} role="group" aria-label={group} className="command-palette-group">
            <span className="command-palette-group-title" aria-hidden="true">{group}</span>
            {groupItemsList.map((item) => (
              <div
                key={item.id}
                id={`${listId}-${item.id}`}
                role="option"
                aria-selected={item.index === safeIndex}
                data-active={item.index === safeIndex || undefined}
                className="command-palette-item"
                onMouseMove={() => setActiveIndex(item.index)}
                onClick={() => runItem(item)}
              >
                <span className="command-palette-item-label">{item.label}</span>
                {item.meta && <span className="command-palette-item-meta">{item.meta}</span>}
                {item.hint && <kbd>{item.hint}</kbd>}
              </div>
            ))}
          </div>
        ))}
      </div>

      <footer className="command-palette-footer" aria-hidden="true">
        <span><kbd>↑</kbd><kbd>↓</kbd> 选择</span>
        <span><kbd>↵</kbd> 打开</span>
        <span><kbd>Esc</kbd> 关闭</span>
      </footer>
    </>
  );
}

/**
 * Zed-style command palette: substring search over posts plus site
 * commands, driven entirely from the keyboard.
 */
export default function CommandPalette({ open, onOpenChange, posts = [], commands = [] }) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="command-palette-overlay" />
        <Dialog.Content className="command-palette" aria-describedby={undefined}>
          <Dialog.Title className="sr-only">命令面板</Dialog.Title>
          <PaletteBody posts={posts} commands={commands} onClose={() => onOpenChange(false)} />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
