# 真实文章分页 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 删除 40 篇 mock 演示功能，并将每页 12 篇的服务端分页应用到真实首页和全部分类页。

**Architecture:** 新增与内容来源无关的纯分页模块，首页和分类页在读取/筛选真实文章后调用它。演示分页组件改名为通用真实文章分页组件，保留已验证的响应式样式和无障碍语义。

**Tech Stack:** Next.js 16 App Router、React 19、Node.js `node:test`、现有 CSS 设计系统

## Global Constraints

- 每页固定 12 篇。
- 首页和所有分类页都分页。
- 分类页必须先筛选再分页。
- 单页时不显示分页控件。
- 分页链接追加 `#archive`。
- 删除 mock 路由、fixture 和专用测试。
- 不创建新文章、不增加客户端状态或第三方依赖。

---

### Task 1: 通用真实文章分页纯函数

**Files:**
- Create: `src/lib/post-pagination.mjs`
- Create: `tests/post-pagination.test.mjs`
- Delete: `tests/demo-posts.test.mjs`
- Delete: `src/lib/demo-posts.mjs`

**Interfaces:**
- Produces: `POSTS_PER_PAGE = 12`, `normalizePostPage(value, totalPages)`, `paginatePosts(posts, value)`.
- `paginatePosts` returns `{ currentPage, totalPages, totalPosts, posts }`.

- [ ] **Step 1: Write failing tests for 0/4/12/13/25 posts and invalid pages**

Use arrays of `{ id }` objects and assert slice lengths, first IDs, total pages, single-page empty behavior, and clamping.

- [ ] **Step 2: Run `npm test` and verify RED because the module is missing**

- [ ] **Step 3: Implement integer parsing, `Math.max(1, ceil(total/12))`, clamping and slicing**

- [ ] **Step 4: Delete mock fixture and its test, then run `npm test`**

Expected: all pagination and existing tests pass.

---

### Task 2: 通用分页组件与真实列表接入

**Files:**
- Create: `src/components/post-pagination.js`
- Delete: `src/components/archive-pagination.js`
- Modify: `src/app/page.js`
- Modify: `src/app/category/[category]/page.js`
- Modify: `src/components/post-card.js`
- Modify: `src/app/globals.css`
- Replace: `tests/demo-ui-contract.test.mjs` with `tests/post-pagination-ui.test.mjs`

**Interfaces:**
- `PostPagination({ currentPage, totalPages, totalPosts, basePath })` returns `null` when `totalPages <= 1`.
- Home and category pages await `searchParams`, call `paginatePosts`, render `PostGrid` then `PostPagination`.

- [ ] **Step 1: Write failing source-contract tests**

Assert both pages await `searchParams` and call `paginatePosts`; category source orders `.filter(` before `paginatePosts(`; component contains single-page early return, `aria-current`, `上一页`, `下一页`, and `#archive`.

- [ ] **Step 2: Run `npm test` and verify RED**

- [ ] **Step 3: Implement `PostPagination` from the validated demo component**

Rename CSS selectors from `archive-pagination*` / `archive-page*` to `post-pagination*` / `post-page*`. Remove `.archive-demo-*` styles.

- [ ] **Step 4: Convert homepage to async `searchParams` pagination**

Read all posts, normalize an array query value, call `paginatePosts`, and render pagination with `basePath="/"`.

- [ ] **Step 5: Convert category page after its existing category filter**

Use `basePath={`/category/${categorySlug}`}` and keep metadata/static category params unchanged.

- [ ] **Step 6: Remove optional demo href from `PostCard` and verify GREEN**

Run: `npm test && npm run lint`.

---

### Task 3: Mock cleanup and complete verification

**Files:**
- Delete: `src/app/demo/archive/page.js`
- Modify only if verification reveals a scoped pagination defect.

**Interfaces:**
- No new interfaces.

- [ ] **Step 1: Delete the demo route and confirm `/demo/archive` returns 404 in development**

- [ ] **Step 2: Verify real homepage and one category page at 1440×1000 and 390×844**

With the current four posts, pagination must be absent, cards unchanged, root scrollbar hidden, wheel scrolling working, and no horizontal overflow.

- [ ] **Step 3: Run final verification**

Run: `npm test && npm run lint && npm run build && git diff --check`.

Expected: all tests pass, production build succeeds, `/demo/archive` is absent from the route table, and no whitespace errors are reported.
