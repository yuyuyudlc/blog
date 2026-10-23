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
 * modifier combinations and focused form inputs. Pass `enabled = false`
 * to pause them, e.g. while a dialog is open.
 */
export function useKeyboardShortcuts(handlers, enabled = true) {
  useEffect(() => {
    if (!enabled) return undefined;

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
  }, [enabled, handlers]);
}
