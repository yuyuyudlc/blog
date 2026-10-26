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

export function isPhotoCategory(category) {
  return category?.layout === 'photos';
}

/**
 * Unit used when counting a category's posts: photos are counted in
 * 张, everything else in 篇.
 */
export function getCategoryUnit(category) {
  return isPhotoCategory(category) ? '张' : '篇';
}
