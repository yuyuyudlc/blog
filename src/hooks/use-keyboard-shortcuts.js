'use client';

import { useEffect } from 'react';

function isEditableElement(element) {
  if (!element) return false;
  return (
    element.tagName === 'INPUT' ||
    element.tagName === 'TEXTAREA' ||
    element.isContentEditable
  );
}

/**
 * Registers global single-key shortcuts (e.g. T, R, H) while ignoring
 * modifier combinations and focused form inputs.
 */
export function useKeyboardShortcuts(handlers) {
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (isEditableElement(document.activeElement)) return;

      const key = event.key.toLowerCase();
      const action = handlers[key];

      if (typeof action === 'function') {
        event.preventDefault();
        action(event);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlers]);
}
