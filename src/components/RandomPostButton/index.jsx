'use client';

import { useRandomPostNavigation } from '@/hooks/use-random-post';
import './index.css';

export default function RandomPostButton({ slugs = [], label = '随机一篇' }) {
  const goRandom = useRandomPostNavigation(slugs);

  return (
    <button
      type="button"
      onClick={goRandom}
      className="random-post-button text-link"
      disabled={slugs.length === 0}
    >
      {label}
    </button>
  );
}
