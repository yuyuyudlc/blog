'use client';

import { useEffect } from 'react';

export default function CodeCopy() {
  useEffect(() => {
    const container = document.querySelector('.article-body');
    if (!container) return undefined;

    const timers = new Map();

    const handleClick = async (event) => {
      const button = event.target.closest('[data-code-copy]');
      if (!button || !container.contains(button)) return;

      const figure = button.closest('.code-block');
      const codeElement = figure?.querySelector('pre code');
      if (!codeElement) return;

      try {
        await navigator.clipboard.writeText(codeElement.textContent || '');
        button.textContent = '已复制';
        button.setAttribute('data-copied', 'true');

        if (timers.has(button)) {
          window.clearTimeout(timers.get(button));
        }

        const timerId = window.setTimeout(() => {
          button.textContent = '复制';
          button.removeAttribute('data-copied');
          timers.delete(button);
        }, 1200);

        timers.set(button, timerId);
      } catch {
        button.textContent = '失败';
      }
    };

    container.addEventListener('click', handleClick);
    return () => {
      container.removeEventListener('click', handleClick);
      timers.forEach((timerId) => window.clearTimeout(timerId));
    };
  }, []);

  return null;
}
