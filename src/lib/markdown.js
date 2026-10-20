import { Marked } from 'marked';
import hljs from 'highlight.js/lib/core';
import bash from 'highlight.js/lib/languages/bash';
import css from 'highlight.js/lib/languages/css';
import javascript from 'highlight.js/lib/languages/javascript';
import json from 'highlight.js/lib/languages/json';
import markdown from 'highlight.js/lib/languages/markdown';
import python from 'highlight.js/lib/languages/python';
import rust from 'highlight.js/lib/languages/rust';
import typescript from 'highlight.js/lib/languages/typescript';
import xml from 'highlight.js/lib/languages/xml';

hljs.registerLanguage('bash', bash);
hljs.registerLanguage('css', css);
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('json', json);
hljs.registerLanguage('markdown', markdown);
hljs.registerLanguage('python', python);
hljs.registerLanguage('rust', rust);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('xml', xml);
hljs.registerAliases(['js', 'jsx', 'mjs'], { languageName: 'javascript' });
hljs.registerAliases(['ts', 'tsx'], { languageName: 'typescript' });
hljs.registerAliases(['sh', 'shell', 'zsh'], { languageName: 'bash' });
hljs.registerAliases(['html', 'svg'], { languageName: 'xml' });
hljs.registerAliases(['md'], { languageName: 'markdown' });

const escapeHtml = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const stripHtmlTags = (value) =>
  String(value ?? '')
    .replace(/<[^>]+>/g, '')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .trim();

const slugifyHeading = (value) =>
  stripHtmlTags(value)
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '');

const CHARACTERS_PER_MINUTE = 400;

export function getReadableCharacterCount(markdownText) {
  const readableText = String(markdownText ?? '')
    .replace(/```[^\n]*\n([\s\S]*?)```/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/^\s{0,3}(?:#{1,6}|>|[-+*]|\d+[.)])\s+/gm, '')
    .replace(/[\\*_~]/g, '')
    .replace(/\s/g, '');

  return Array.from(readableText).length;
}

export function estimateReadingTime(markdownText) {
  const minutes = Math.max(
    1,
    Math.ceil(getReadableCharacterCount(markdownText) / CHARACTERS_PER_MINUTE),
  );

  return `${minutes} min read`;
}

/**
 * Renders Markdown text into HTML, assigning deterministic IDs to headings,
 * collecting h2/h3 entries for the table of contents, and wrapping fenced
 * code blocks in a Zed-style `.code-window` figure.
 */
export function renderMarkdown(markdownText) {
  const headings = [];
  const seenIds = new Map();

  const parser = new Marked({
    gfm: true,
    renderer: {
      heading({ tokens, depth }) {
        const innerHtml = this.parser.parseInline(tokens);
        const plainText = stripHtmlTags(innerHtml);
        const baseId = slugifyHeading(plainText) || 'section';
        const seenCount = seenIds.get(baseId) ?? 0;
        seenIds.set(baseId, seenCount + 1);
        const id = seenCount > 0 ? `${baseId}-${seenCount}` : baseId;

        if (depth === 2 || depth === 3) {
          headings.push({
            id,
            depth,
            text: plainText,
          });
        }

        return `<h${depth} id="${escapeHtml(id)}">${innerHtml}</h${depth}>`;
      },
      code({ text, lang }) {
        const parts = String(lang ?? '').trim().split(/\s+/).filter(Boolean);
        const rawLang = (parts[0] || '').toLowerCase();
        const filename = parts.slice(1).join(' ');
        const canHighlight = rawLang && hljs.getLanguage(rawLang);
        const highlightedHtml = canHighlight
          ? hljs.highlight(text, { language: rawLang, ignoreIllegals: true }).value
          : escapeHtml(text);

        const languageClass = rawLang ? ` language-${escapeHtml(rawLang)}` : '';
        const displayLang = escapeHtml((rawLang || 'code').toUpperCase());
        const tabLabel = escapeHtml(filename || displayLang);

        return `<figure class="code-window" data-language="${displayLang}"><figcaption class="code-window-bar"><span class="code-window-tab">${tabLabel}</span><div class="code-window-actions">${filename ? `<span class="code-window-lang">${displayLang}</span>` : ''}<button type="button" class="code-window-copy" data-code-copy aria-label="复制代码">复制</button></div></figcaption><pre><code class="hljs${languageClass}">${highlightedHtml}</code></pre></figure>`;
      },
    },
  });

  const contentHtml = parser.parse(markdownText);
  return { contentHtml, headings };
}
