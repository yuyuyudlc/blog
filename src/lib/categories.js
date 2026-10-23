import { siteConfig } from '@/config/site';

/**
 * Category lookups that are safe to import from client components
 * (no filesystem access, unlike `@/lib/posts`).
 */
export function getCategoryByLabel(label) {
  return siteConfig.categories.find((category) => category.label === label) || null;
}

export function getCategoryBySlug(slug) {
  return siteConfig.categories.find((category) => category.slug === slug) || null;
}
