import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { Marked } from 'marked';
import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
import rust from 'highlight.js/lib/languages/rust';

const postsDirectory = path.join(process.cwd(), 'posts');

hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('rust', rust);
hljs.registerAliases(['js', 'jsx'], { languageName: 'javascript' });

const escapeHtml = (value) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const getCodeLanguage = (lang = '') => lang.trim().split(/\s+/)[0].toLowerCase();

const markdownParser = new Marked({
  gfm: true,
  renderer: {
    code({ text, lang }) {
      const language = getCodeLanguage(lang);
      const canHighlight = language && hljs.getLanguage(language);
      const html = canHighlight
        ? hljs.highlight(text, { language, ignoreIllegals: true }).value
        : escapeHtml(text);
      const languageClass = language ? ` language-${escapeHtml(language)}` : '';
      const languageLabel = language ? ` data-language="${escapeHtml(language.toUpperCase())}"` : '';

      return `<pre${languageLabel}><code class="hljs${languageClass}">${html}</code></pre>`;
    },
  },
});

// Helper to get sorted posts list (for the home page listing)
export function getAllPosts() {
  // Ensure the directory exists
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

      // Use gray-matter to parse the post metadata section
      const { data } = matter(fileContents);

      return {
        slug,
        ...data,
      };
    });

  // Sort posts by date (newest first)
  return allPostsData.sort((a, b) => {
    return new Date(b.date) - new Date(a.date);
  });
}

// Helper to get detailed post data (slug, parsed HTML content, and metadata)
export async function getPostBySlug(slug) {
  const fullPath = path.join(postsDirectory, `${slug}.md`);
  if (!fs.existsSync(fullPath)) {
    return null;
  }

  const fileContents = fs.readFileSync(fullPath, 'utf8');

  // Use gray-matter to parse metadata and content
  const { data, content } = matter(fileContents);

  // Convert markdown to HTML and highlight fenced code blocks during rendering.
  const contentHtml = markdownParser.parse(content);

  return {
    slug,
    contentHtml,
    ...data,
  };
}
