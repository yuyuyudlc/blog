import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { siteConfig } from '@/config/site';
import {
  estimateReadingTime,
  getReadableCharacterCount,
  renderMarkdown,
} from '@/lib/markdown';

import { getCategoryByLabel, isPhotoCategory } from '@/lib/categories';

export { getCategoryByLabel, getCategoryBySlug } from '@/lib/categories';

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

export function isPhotoPost(post) {
  return isPhotoCategory(getCategoryByLabel(post.category));
}

/**
 * Written posts only — photos live in their own room and are kept out of
 * the article lists, the archive and the article loop.
 */
export function getArticles(posts = getAllPosts()) {
  return posts.filter((post) => !isPhotoPost(post));
}

export function getPhotos(posts = getAllPosts()) {
  return posts.filter(isPhotoPost);
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

/**
 * Returns the neighbouring posts as an endless loop, like the parallel
 * four-and-a-half-tatami rooms: past the oldest post you arrive at the
 * newest one again, and vice versa. Returns `null` neighbours when there
 * is no other post to loop to.
 */
export function getLoopPosts(slug, posts = getAllPosts()) {
  const index = posts.findIndex((post) => post.slug === slug);
  if (index === -1 || posts.length < 2) {
    return { older: null, newer: null };
  }

  const olderIndex = (index + 1) % posts.length;
  const newerIndex = (index - 1 + posts.length) % posts.length;

  return {
    older: { post: posts[olderIndex], wrapped: olderIndex < index },
    newer: { post: posts[newerIndex], wrapped: newerIndex > index },
  };
}
