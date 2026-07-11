# 40 篇文章归档演示页 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 新增一个开发环境专用的 40 篇文章归档演示页，用分页和边界内容验证博客在文章数量增长后的布局表现。

**Architecture:** 使用独立纯数据模块生成 40 条稳定 fixture，并由纯函数负责页码规范化和切片。演示路由通过服务端 `searchParams` 读取页码，在生产环境调用 `notFound()`；现有 `PostGrid` 继续负责卡片渲染，新增分页组件负责导航。

**Tech Stack:** Next.js 16 App Router、React 19、Node.js `node:test`、现有 CSS 设计系统

## Global Constraints

- 不创建或修改任何 `posts/*.md` 文件。
- 不改变真实首页、分类页和文章解析数据。
- fixture 恰好包含 40 条，覆盖中英文、长短标题、摘要、分类和标签边界。
- 每页 12 条，共 4 页；无效页码规范到最近的有效页。
- `/demo/archive` 在生产环境调用 `notFound()`。
- 演示卡片只链接到现有真实文章。
- 不增加客户端状态、第三方依赖或正式搜索功能。

---

### Task 1: 演示数据与分页纯函数

**Files:**
- Create: `src/lib/demo-posts.mjs`
- Create: `tests/demo-posts.test.mjs`

**Interfaces:**
- Produces: `DEMO_PAGE_SIZE`, `demoPosts`, `normalizeDemoPage(value, totalPages)`, `getDemoPage(value)`.
- `getDemoPage` returns `{ currentPage, totalPages, totalPosts, posts }`.

- [ ] **Step 1: Write failing tests**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEMO_PAGE_SIZE,
  demoPosts,
  getDemoPage,
  normalizeDemoPage,
} from '../src/lib/demo-posts.mjs';

test('provides forty unique mixed-language demo posts', () => {
  assert.equal(demoPosts.length, 40);
  assert.equal(new Set(demoPosts.map((post) => post.id)).size, 40);
  assert.ok(demoPosts.some((post) => /[\u4e00-\u9fff]/.test(post.title)));
  assert.ok(demoPosts.some((post) => /^[\x00-\x7f]+$/.test(post.title)));
  assert.ok(demoPosts.some((post) => post.title.length >= 48));
  assert.equal(new Set(demoPosts.map((post) => post.category)).size, 5);
});

test('uses twelve posts per page and returns four pages', () => {
  assert.equal(DEMO_PAGE_SIZE, 12);
  assert.equal(getDemoPage('1').posts.length, 12);
  assert.equal(getDemoPage('4').posts.length, 4);
  assert.equal(getDemoPage('4').totalPages, 4);
});

test('clamps invalid pages to the valid range', () => {
  assert.equal(normalizeDemoPage(undefined, 4), 1);
  assert.equal(normalizeDemoPage('abc', 4), 1);
  assert.equal(normalizeDemoPage('-3', 4), 1);
  assert.equal(normalizeDemoPage('99', 4), 4);
});
```

- [ ] **Step 2: Verify RED**

Run: `npm test`

Expected: FAIL because `src/lib/demo-posts.mjs` does not exist.

- [ ] **Step 3: Implement deterministic fixture and pagination**

Create five category values, 40 explicit mixed-language title/summary pairs, four valid article hrefs, and deterministic ISO dates descending from `2026-07-10`. Map them to objects with unique `demo-01` through `demo-40` IDs. Implement integer parsing, clamping and array slicing without reading the filesystem.

- [ ] **Step 4: Verify GREEN**

Run: `npm test`

Expected: all existing tests plus three demo tests pass.

---

### Task 2: Card link contract and pagination component

**Files:**
- Create: `src/components/archive-pagination.js`
- Create: `tests/demo-ui-contract.test.mjs`
- Modify: `src/components/post-card.js`

**Interfaces:**
- `PostCard` consumes optional `post.href`; fallback remains `/posts/${post.slug}`.
- `ArchivePagination` consumes `{ currentPage, totalPages, totalPosts, basePath }`.

- [ ] **Step 1: Write failing UI contract tests**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('post cards accept an explicit demo href', async () => {
  const source = await readFile(new URL('../src/components/post-card.js', import.meta.url), 'utf8');
  assert.match(source, /post\.href\s*\|\|\s*`\/posts\/\$\{post\.slug\}`/);
});

test('pagination exposes current-page semantics and Chinese totals', async () => {
  const source = await readFile(new URL('../src/components/archive-pagination.js', import.meta.url), 'utf8');
  assert.match(source, /aria-current/);
  assert.match(source, /共.*篇/);
  assert.match(source, /上一页/);
  assert.match(source, /下一页/);
});
```

- [ ] **Step 2: Verify RED**

Run: `npm test`

Expected: FAIL because explicit href handling and pagination component are missing.

- [ ] **Step 3: Implement explicit card links**

Set the card link destination to `post.href || `/posts/${post.slug}`` and retain all existing markup and behavior.

- [ ] **Step 4: Implement server-rendered pagination**

Render a `<nav aria-label="归档分页">` containing summary text, previous/next links when applicable, and page links from 1 through `totalPages`. Generate hrefs as `${basePath}?page=${page}` and set `aria-current="page"` on the current page link.

- [ ] **Step 5: Verify GREEN**

Run: `npm test && npm run lint`

Expected: all tests pass and ESLint exits 0.

---

### Task 3: Development-only archive route and styling

**Files:**
- Create: `src/app/demo/archive/page.js`
- Modify: `src/app/globals.css`
- Modify: `tests/demo-ui-contract.test.mjs`

**Interfaces:**
- Route consumes `searchParams: Promise<{ page?: string | string[] }>` per Next.js 16 page contract.
- Route renders existing `HomeHero`, `DividerSlash`, `PostGrid`, and new `ArchivePagination`.

- [ ] **Step 1: Add failing route contract test**

Assert that the route imports `notFound`, checks `process.env.NODE_ENV !== 'development'`, awaits `searchParams`, calls `getDemoPage`, and renders `ArchivePagination`.

Run: `npm test`

Expected: FAIL because the route does not exist.

- [ ] **Step 2: Implement route**

Create an async page. Call `notFound()` outside development. Await `searchParams`, normalize an array page value to its first item, obtain the current slice, and render an intro block showing `40 篇文章布局压力测试`, followed by the existing article grid and pagination.

- [ ] **Step 3: Add scoped archive demo styles**

Add `.archive-demo-header`, `.archive-demo-kicker`, `.archive-pagination`, `.archive-pagination-summary`, `.archive-pagination-links`, and `.archive-page-link`. Reuse theme tokens, mono font, borders and focus styles. Under 767px, reduce padding and allow pagination links to wrap. Do not add any page-level overflow container.

- [ ] **Step 4: Verify GREEN**

Run: `npm test && npm run lint && npm run build`

Expected: tests and lint pass; production build succeeds with the demo route resolving through its 404 guard.

---

### Task 4: Browser verification

**Files:**
- Modify only if verification reveals a scoped defect in the files above.

**Interfaces:**
- No new interfaces.

- [ ] **Step 1: Verify desktop pages**

Open `/demo/archive?page=1`, `?page=2`, and `?page=4` at 1440×1000 in development. Confirm 12/12/4 cards, correct current-page state, valid previous/next links, no duplicate key warning, and no horizontal overflow.

- [ ] **Step 2: Verify mobile pages**

Open page 1 and page 4 at 390×844. Confirm long titles wrap, pagination wraps without clipping, horizontal category tabs remain usable, root scrollbar remains hidden, and wheel/touch scrolling remains functional.

- [ ] **Step 3: Run final verification**

Run: `npm test && npm run lint && npm run build && git diff --check`

Expected: all tests pass, lint and build exit 0, and no whitespace errors are reported.
