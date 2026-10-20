'use client';

import { useEffect, useState } from 'react';

export default function ArticleToc({ headings = [] }) {
  const [activeId, setActiveId] = useState(headings[0]?.id || '');

  useEffect(() => {
    if (!headings.length) return undefined;

    const elements = headings
      .map((item) => document.getElementById(item.id))
      .filter(Boolean);

    if (!elements.length) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      {
        rootMargin: '-72px 0px -65% 0px',
        threshold: [0, 1],
      },
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [headings]);

  if (!headings.length) {
    return null;
  }

  return (
    <nav className="article-toc" aria-label="文章目录">
      <span className="meta-label">目录</span>
      <ul className="article-toc-list">
        {headings.map((heading) => (
          <li key={heading.id}>
            <a
              href={`#${heading.id}`}
              className={`article-toc-link ${heading.depth === 3 ? 'article-toc-link-sub' : ''}`.trim()}
              data-active={activeId === heading.id || undefined}
              onClick={() => setActiveId(heading.id)}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
