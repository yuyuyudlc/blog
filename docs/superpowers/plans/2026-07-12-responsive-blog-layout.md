# 响应式博客排版与中文界面 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 修复博客桌面端与移动端排版，统一中文界面，并通过自托管 Noto 字体保证中英文在不同操作系统上的一致表现。

**Architecture:** 保留现有组件和视觉系统，新增纯展示格式化模块，将字体变量挂载在根布局，并分别调整 Header 与文章页的响应式结构。文章页改用自然页面滚动，桌面元信息内部吸顶，移动元信息使用无滚动的紧凑网格。

**Tech Stack:** Next.js 16 App Router、React 19、CSS、`next/font/google`、Node.js `node:test`

## Global Constraints

- 界面文案使用中文，文章标题、摘要、正文、分类和标签保持原文。
- 移动端分类导航使用横向滑动 Tab，不使用折叠菜单。
- 正文与界面使用 Noto Sans SC，衬线标题使用 Noto Serif SC，等宽文本使用 IBM Plex Mono。
- 字体通过 `next/font` 自托管，不使用 CSS `@import` 或依赖系统中文字体。
- 文章页只允许页面级纵向滚动；代码块可以横向滚动。
- 不引入新的 UI 框架、状态管理库或测试依赖。

---

### Task 1: 中文展示格式化与界面文案

**Files:**
- Create: `src/lib/post-display.mjs`
- Create: `tests/post-display.test.mjs`
- Modify: `package.json`
- Modify: `src/config/site.js`
- Modify: `src/components/home-hero.js`
- Modify: `src/components/post-card.js`
- Modify: `src/components/article-back-link.js`
- Modify: `src/components/article-meta-sidebar.js`
- Modify: `src/components/site-header-controls.js`
- Modify: `src/components/site-shell.js`
- Modify: `src/app/layout.js`
- Modify: `src/app/category/[category]/page.js`

**Interfaces:**
- Produces: `formatPostDate(value): string` and `formatReadingTime(value): string` from `src/lib/post-display.mjs`.
- Consumers: post cards and article metadata.

- [ ] **Step 1: Write failing formatting tests**

```js
// tests/post-display.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { formatPostDate, formatReadingTime } from '../src/lib/post-display.mjs';

test('formats an English date string for the Chinese interface', () => {
  assert.equal(formatPostDate('June 28, 2026'), '2026年6月28日');
});

test('formats ISO dates without a timezone day shift', () => {
  assert.equal(formatPostDate('2026-06-30'), '2026年6月30日');
});

test('formats reading time from the existing English metadata', () => {
  assert.equal(formatReadingTime('6 min read'), '约 6 分钟');
});

test('preserves an unparseable display value', () => {
  assert.equal(formatPostDate('待定'), '待定');
  assert.equal(formatReadingTime('短文'), '短文');
});
```

- [ ] **Step 2: Add the test command and verify RED**

Add `"test": "node --test tests/*.test.mjs"` to `package.json` scripts.

Run: `npm test`

Expected: FAIL because `src/lib/post-display.mjs` does not exist.

- [ ] **Step 3: Implement the minimal formatting module**

```js
const dateFormatter = new Intl.DateTimeFormat('zh-CN', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  timeZone: 'UTC',
});

export function formatPostDate(value) {
  if (value instanceof Date && !Number.isNaN(value.valueOf())) {
    return dateFormatter.format(value);
  }

  if (typeof value !== 'string') return String(value ?? '');

  const isoMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const date = isoMatch
    ? new Date(Date.UTC(Number(isoMatch[1]), Number(isoMatch[2]) - 1, Number(isoMatch[3])))
    : new Date(value);

  return Number.isNaN(date.valueOf()) ? value : dateFormatter.format(date);
}

export function formatReadingTime(value) {
  const text = String(value ?? '');
  const minutes = text.match(/\d+/)?.[0];
  return minutes ? `约 ${minutes} 分钟` : text;
}
```

- [ ] **Step 4: Verify GREEN**

Run: `npm test`

Expected: 4 tests pass, 0 fail.

- [ ] **Step 5: Localize UI and consume the formatters**

Update `siteConfig` to use Chinese description, tagline, author, copyright and navigation labels. Set `<html lang="zh-CN">`. Translate all UI-only strings, including `阅读文章`, `暂无文章`, `返回文章列表`, `分类`, `发布于`, `作者`, `阅读时长`, `标签`, theme button labels/toasts, `文章列表`, `返回顶部`, and `文章结束`.

In `post-card.js` and `article-meta-sidebar.js`, render dates with `formatPostDate(post.date)` and time with `formatReadingTime(post.readingTime)`. Keep titles, summaries, tags and Markdown content unchanged. Change category metadata descriptions to Chinese.

- [ ] **Step 6: Run focused verification**

Run: `npm test && npm run lint`

Expected: tests pass and ESLint exits 0.

---

### Task 2: Cross-platform self-hosted fonts

**Files:**
- Create: `tests/font-contract.test.mjs`
- Modify: `src/app/layout.js`
- Modify: `src/app/globals.css`

**Interfaces:**
- Produces CSS variables: `--font-noto-sans-sc`, `--font-noto-serif-sc`, `--font-ibm-plex-mono`.
- Consumers: the existing `--font-sans`, `--font-serif`, and `--font-mono` design tokens.

- [ ] **Step 1: Write a failing font contract test**

```js
// tests/font-contract.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('uses self-hosted Next fonts and removes the CSS Google import', async () => {
  const [layout, css] = await Promise.all([
    readFile(new URL('../src/app/layout.js', import.meta.url), 'utf8'),
    readFile(new URL('../src/app/globals.css', import.meta.url), 'utf8'),
  ]);

  assert.match(layout, /Noto_Sans_SC/);
  assert.match(layout, /Noto_Serif_SC/);
  assert.match(layout, /IBM_Plex_Mono/);
  assert.doesNotMatch(css, /fonts\.googleapis\.com/);
  assert.match(css, /var\(--font-noto-serif-sc\)/);
});
```

- [ ] **Step 2: Verify RED**

Run: `npm test -- tests/font-contract.test.mjs`

Expected: FAIL because layout has no `next/font` imports and CSS still contains Google Fonts `@import`.

- [ ] **Step 3: Configure fonts in the root layout**

Import `Noto_Sans_SC`, `Noto_Serif_SC`, and `IBM_Plex_Mono` from `next/font/google`. Configure Noto families with variable weights and CSS variables; configure IBM Plex Mono with weights 400, 500, 600 and 700. Apply all three `.variable` class names to `<html>`.

Use `display: 'swap'`. Use `preload: false` for the Noto SC families because their CJK unicode ranges are not represented by the generated TypeScript subset union; let the emitted unicode-range CSS load only required glyph resources. Keep IBM Plex Mono on its Latin subset.

- [ ] **Step 4: Replace CSS font tokens**

Remove the Google Fonts `@import` and define:

```css
--font-sans: var(--font-noto-sans-sc), sans-serif;
--font-serif: var(--font-noto-serif-sc), serif;
--font-mono: var(--font-ibm-plex-mono), var(--font-noto-sans-sc), monospace;
```

- [ ] **Step 5: Verify GREEN and production compilation**

Run: `npm test && npm run build`

Expected: all tests pass and Next.js production build exits 0 without font option errors.

---

### Task 3: Two-row mobile Header with horizontal category tabs

**Files:**
- Create: `tests/responsive-css-contract.test.mjs`
- Modify: `src/app/globals.css`

**Interfaces:**
- Consumes existing `.site-header`, `.logo-group`, `.site-nav`, `.nav-link`, and `.nav-actions` class names.
- Produces mobile Header behavior at `max-width: 767px`.

- [ ] **Step 1: Write the failing responsive CSS contract**

```js
// tests/responsive-css-contract.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const cssUrl = new URL('../src/app/globals.css', import.meta.url);

test('mobile navigation has its own horizontally scrollable row', async () => {
  const css = await readFile(cssUrl, 'utf8');
  assert.match(css, /\.site-header\s*\{[^}]*grid-template-areas/s);
  assert.match(css, /\.site-nav\s*\{[^}]*overflow-x:\s*auto/s);
  assert.match(css, /scrollbar-width:\s*none/);
  assert.match(css, /touch-action:\s*pan-x/);
});
```

- [ ] **Step 2: Verify RED**

Run: `npm test -- tests/responsive-css-contract.test.mjs`

Expected: FAIL because the mobile Header rules do not exist.

- [ ] **Step 3: Implement responsive Header CSS**

Assign desktop grid areas for logo, nav and actions. Under `max-width: 767px`, change the Header to two columns and two rows with `height: auto`, place Logo/actions in row one and nav across row two, and set the nav to `overflow-x: auto`, `scrollbar-width: none`, `touch-action: pan-x`, `white-space: nowrap`, and overscroll containment. Hide the WebKit scrollbar.

Update article-height assumptions and decorative guide offsets to use a `--header-height` token: 57px desktop and the actual two-row mobile height. Ensure the Logo never wraps and all tab links keep their intrinsic width.

- [ ] **Step 4: Verify GREEN**

Run: `npm test && npm run lint`

Expected: tests pass and ESLint exits 0.

---

### Task 4: Natural article scrolling and responsive metadata

**Files:**
- Modify: `tests/responsive-css-contract.test.mjs`
- Modify: `src/components/article-meta-sidebar.js`
- Modify: `src/app/globals.css`

**Interfaces:**
- Produces `.post-meta-sidebar-inner` as the sticky desktop content wrapper.
- Removes `.post-main` and `.post-meta-sidebar` nested vertical scrolling.

- [ ] **Step 1: Extend the responsive contract test and verify RED**

Add assertions that CSS does not contain `.post-main` with `overflow-y: auto` or hidden scrollbars, does contain `.post-meta-sidebar-inner` with `position: sticky`, and defines a mobile metadata grid.

Run: `npm test -- tests/responsive-css-contract.test.mjs`

Expected: FAIL because the old nested scrolling rules are still present.

- [ ] **Step 2: Add the sidebar inner wrapper**

Wrap all `MetaItem` children in:

```jsx
<div className="post-meta-sidebar-inner">...</div>
```

Keep `<aside className="post-meta-sidebar">` as the grid column and full-height border owner.

- [ ] **Step 3: Replace fixed-height article CSS**

Remove the `height: calc(100vh - 57px)`, `overflow: hidden`, `height: 100%`, `max-height`, `.post-main { overflow-y: auto }`, hidden scrollbar, and mobile `max-height: 220px` rules. Let `.post-detail-layout` grow with content.

On desktop, keep `grid-template-columns: 280px minmax(0, 1fr)`, make the sidebar stretch, and set `.post-meta-sidebar-inner { position: sticky; top: calc(var(--header-height) + 1px); }` with suitable padding.

Under 991px, use one column and a compact two-column `.post-meta-sidebar-inner` grid; make the tags item span the full row. Under 560px, allow the metadata grid to collapse safely without overflow.

Set `.post-main` width to 100%, retain `max-width: 800px`, and use `font-size: clamp(2.125rem, 8vw, 3.25rem)` for `.post-title-main`.

- [ ] **Step 4: Verify GREEN**

Run: `npm test && npm run lint`

Expected: tests pass and ESLint exits 0.

---

### Task 5: Contrast, motion preferences, and CSS cleanup

**Files:**
- Modify: `tests/responsive-css-contract.test.mjs`
- Modify: `src/app/globals.css`

**Interfaces:**
- Updates light theme `--text-muted` while preserving dark theme hierarchy.
- Produces `prefers-reduced-motion: reduce` behavior.

- [ ] **Step 1: Add failing accessibility style assertions**

Assert that CSS contains `@media (prefers-reduced-motion: reduce)` and no longer contains duplicate mobile Hero/card media blocks at the end of the file.

Run: `npm test -- tests/responsive-css-contract.test.mjs`

Expected: FAIL because reduced-motion rules are missing and mobile rules are duplicated.

- [ ] **Step 2: Implement accessibility styles**

Darken the light theme `--text-muted` enough for small text to exceed 4.5:1 against `--bg-color`. Add a reduced-motion media query that disables non-essential animations and transitions while retaining visible focus styles. Consolidate duplicated `max-width: 900px` and `max-width: 767px` rules without changing their intended layout.

- [ ] **Step 3: Verify GREEN**

Run: `npm test && npm run lint`

Expected: tests pass and ESLint exits 0.

---

### Task 6: Full build and visual regression verification

**Files:**
- Modify only if verification exposes a scoped defect in the files above.

**Interfaces:**
- No new interfaces; validates all previous tasks together.

- [ ] **Step 1: Run the full automated suite**

Run: `npm test && npm run lint && npm run build`

Expected: all Node tests pass, ESLint exits 0, and Next.js production build exits 0.

- [ ] **Step 2: Verify desktop layouts**

Use the local app at 1440×1000 in both themes. Check homepage and a long English article. Confirm one-line Header, two-column article layout, sticky metadata content, readable title measures, rendered Noto fonts, and no horizontal page overflow.

- [ ] **Step 3: Verify mobile layouts**

Use 390×844 in both themes. Confirm Logo and theme button do not overlap, category tabs scroll horizontally, metadata has no vertical scrollbar, the browser page is the only vertical scroller, long titles remain readable, code blocks scroll horizontally, and the document has no horizontal page overflow.

- [ ] **Step 4: Inspect rendered font and contrast metrics**

Read computed font families for a Chinese card title, English article title, body copy, and code. Confirm title uses Noto Serif SC, body uses Noto Sans SC, and code uses IBM Plex Mono. Compute light-theme muted-text contrast against the page background and require at least 4.5:1.

- [ ] **Step 5: Review the final diff**

Run: `git diff --check && git status --short && git diff --stat`

Expected: no whitespace errors; only planned source, test, package, and documentation files are modified.
