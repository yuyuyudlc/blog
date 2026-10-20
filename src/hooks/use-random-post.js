'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useCallback } from 'react';

/**
 * Returns a callback that navigates to a random post slug,
 * excluding the currently viewed post when possible.
 */
export function useRandomPostNavigation(slugs = []) {
  const router = useRouter();
  const pathname = usePathname();

  return useCallback(() => {
    if (!slugs.length) return;

    const pool = slugs.filter((slug) => `/posts/${slug}` !== pathname);
    const candidates = pool.length > 0 ? pool : slugs;
    const targetSlug = candidates[Math.floor(Math.random() * candidates.length)];
    router.push(`/posts/${targetSlug}`);
  }, [pathname, router, slugs]);
}
