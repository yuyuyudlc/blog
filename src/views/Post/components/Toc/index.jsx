'use client';

import { useEffect, useState } from 'react';
import './index.css';

/**
 * Table of contents floating in the left margin on wide screens. It
 * stays faint and only marks the section currently being read.
 */
export default function Toc({ headings = [] }) {
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
        rootMargin: '0px 0px -65% 0px',
        threshold: [0, 1],
      },
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [headings]);

  if (!headings.length) return null;

  return (
    <nav className="toc" aria-label="文章目录">
      <ol className="toc-list">
        {headings.map((heading) => (
          <li key={heading.id}>
            <a
              href={`#${heading.id}`}
              className="toc-link"
              data-depth={heading.depth}
              aria-current={activeId === heading.id ? 'location' : undefined}
              onClick={() => setActiveId(heading.id)}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
