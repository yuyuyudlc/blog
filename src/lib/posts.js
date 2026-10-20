import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { siteConfig } from '@/config/site';
import {
  estimateReadingTime,
  getReadableCharacterCount,
  renderMarkdown,
} from '@/lib/markdown';
import { parsePostDate } from '@/lib/post-display.mjs';

const postsDirectory = path.join(process.cwd(), 'posts');

/**
 * Returns all Markdown posts sorted from newest to oldest.
 */
export function getAllPosts() {
  if (!fs.existsSync(postsDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(postsDirectory);
  const allPostsData = fileNames
    .filter((fileName) => fileName.endsWith('.md'))
    .map((fileName) => {
      const slug = fileName.replace(/\.md$/, '');
      const fullPath = path.join(postsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const { data, content } = matter(fileContents);
      const charCount = getReadableCharacterCount(content);

      return {
        slug,
        ...data,
        charCount,
        readingTime: estimateReadingTime(content),
      };
    });

  return allPostsData.sort((a, b) => new Date(b.date) - new Date(a.date));
}

/**
 * Loads a single post by slug, including rendered HTML and TOC headings.
 */
export async function getPostBySlug(slug) {
  const fullPath = path.join(postsDirectory, `${slug}.md`);
  if (!fs.existsSync(fullPath)) {
    return null;
  }

  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const { data, content } = matter(fileContents);
  const { contentHtml, headings } = renderMarkdown(content);
  const charCount = getReadableCharacterCount(content);

  return {
    slug,
    contentHtml,
    headings,
    ...data,
    charCount,
    readingTime: estimateReadingTime(content),
  };
}

/**
 * Returns a map of `{ [categorySlug]: postCount }`.
 */
export function getCategoryStats(posts = getAllPosts()) {
  return Object.fromEntries(
    siteConfig.categories.map((category) => [
      category.slug,
      posts.filter((post) => post.category === category.label).length,
    ]),
  );
}

export function getCategoryByLabel(label) {
  return siteConfig.categories.find((category) => category.label === label) || null;
}

export function getCategoryBySlug(slug) {
  return siteConfig.categories.find((category) => category.slug === slug) || null;
}

/**
 * Returns the adjacent `{ newer, older }` posts relative to `slug`.
 */
export function getAdjacentPosts(slug, posts = getAllPosts()) {
  const index = posts.findIndex((post) => post.slug === slug);
  if (index === -1) {
    return { newer: null, older: null };
  }

  return {
    newer: posts[index - 1] ?? null,
    older: posts[index + 1] ?? null,
  };
}

/**
 * Checks whether a post was published within the last `days` days.
 */
export function isRecentPost(dateValue, days = 7) {
  const date = parsePostDate(dateValue);
  if (!date) return false;

  const diffMs = Date.now() - date.getTime();
  return diffMs >= 0 && diffMs <= days * 86400000;
}
