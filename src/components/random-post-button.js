'use client';

import { useRandomPostNavigation } from '@/hooks/use-random-post';

export default function RandomPostButton({
  slugs = [],
  className = 'btn',
  label = '再来一次',
  showKbd = true,
  children,
}) {
  const goRandom = useRandomPostNavigation(slugs);

  return (
    <button
      type="button"
      onClick={goRandom}
      className={className}
      disabled={slugs.length === 0}
      title={`${label}（R）`}
    >
      {children || (
        <>
          <span>{label}</span>
          {showKbd && <kbd>R</kbd>}
        </>
      )}
    </button>
  );
}
