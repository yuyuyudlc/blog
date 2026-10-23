'use client';

import { useSyncExternalStore } from 'react';

const subscribe = () => () => {};

function getClientLabel() {
  return /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent) ? '⌘' : 'Ctrl';
}

/**
 * Returns the label of the platform's command modifier: `⌘` on Apple
 * devices, `Ctrl` elsewhere. Renders `⌘` on the server.
 */
export function useModKeyLabel() {
  return useSyncExternalStore(subscribe, getClientLabel, () => '⌘');
}
