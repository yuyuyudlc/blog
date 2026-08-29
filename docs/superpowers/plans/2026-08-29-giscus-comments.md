# Giscus Comments Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a responsive, Chinese Giscus comment section to every article page and configure `yuyuyudlc/blog` to store comments in GitHub Discussions.

**Architecture:** The server-rendered article page builds a public Giscus configuration and passes it into one focused client component. The client component owns the third-party React widget and mirrors the blog's `data-theme`; GitHub Discussions owns authentication, comments, replies, and moderation.

**Tech Stack:** Next.js 16 App Router, React 19, `@giscus/react`, GitHub Discussions, Node test runner, CSS

**Spec:** `docs/superpowers/specs/2026-08-29-giscus-comments-design.md`

## Global Constraints

- Render comments only on `/posts/{slug}` article pages.
- Use repository `yuyuyudlc/blog` and repository ID `R_kgDOTI2hng`.
- Map discussions by `pathname` with strict matching.
- Use Chinese UI, reactions, top-positioned input, lazy loading, and no metadata events.
- Keep configuration public and environment-driven; never add tokens or OAuth secrets.
- Keep article reading functional when configuration or the third-party iframe is unavailable.
- Match the existing light/dark theme and avoid horizontal overflow on mobile.
- Preserve all unrelated uncommitted work already present in the working tree.

---

## File Map

- Create `src/lib/giscus-config.mjs`: normalize public environment variables and expose an enabled flag plus the fallback Discussions URL.
- Create `src/components/giscus-comments.js`: render the Chinese section, official Giscus React component, theme observer, and unconfigured fallback.
- Modify `src/app/posts/[slug]/page.js`: build configuration on the server and place comments after the article footer.
- Modify `src/app/globals.css`: style the comment boundary, fallback, and mobile width behavior.
- Modify `package.json` and `package-lock.json`: add the official `@giscus/react` dependency.
- Create `tests/giscus-config.test.mjs`: exercise configuration defaults and missing-category behavior.
- Create `tests/giscus-ui.test.mjs`: protect article-only placement, widget options, theme synchronization, and responsive CSS.
- Modify `.gitignore` and create `.env.example`: document the four public Giscus settings without committing local environment files.

---

### Task 1: Public Giscus Configuration

**Files:**
- Create: `src/lib/giscus-config.mjs`
- Create: `tests/giscus-config.test.mjs`
- Modify: `.gitignore`
- Create: `.env.example`

**Interfaces:**
- Consumes: a plain environment object with `NEXT_PUBLIC_GISCUS_REPO`, `NEXT_PUBLIC_GISCUS_REPO_ID`, `NEXT_PUBLIC_GISCUS_CATEGORY`, and `NEXT_PUBLIC_GISCUS_CATEGORY_ID`.
- Produces: `getGiscusConfig(env): { repo, repoId, category, categoryId, enabled, discussionsUrl }`.

- [ ] **Step 1: Read the installed Next.js environment and client-boundary guides**

Run:

```powershell
Get-Content -Raw node_modules/next/dist/docs/01-app/02-guides/environment-variables.md
Get-Content -Raw node_modules/next/dist/docs/01-app/01-getting-started/05-server-and-client-components.md
Get-Content -Raw node_modules/next/dist/docs/01-app/03-api-reference/01-directives/use-client.md
```

Expected: confirm that public values may be passed from a server component into a serializable client-component prop, while browser-only APIs remain behind `'use client'`.

- [ ] **Step 2: Write the failing configuration tests**

Create `tests/giscus-config.test.mjs`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { getGiscusConfig } from '../src/lib/giscus-config.mjs';

test('uses the blog repository defaults and enables complete configuration', () => {
  assert.deepEqual(getGiscusConfig({
    NEXT_PUBLIC_GISCUS_CATEGORY: 'Announcements',
    NEXT_PUBLIC_GISCUS_CATEGORY_ID: 'DIC_example',
  }), {
    repo: 'yuyuyudlc/blog',
    repoId: 'R_kgDOTI2hng',
    category: 'Announcements',
    categoryId: 'DIC_example',
    enabled: true,
    discussionsUrl: 'https://github.com/yuyuyudlc/blog/discussions',
  });
});

test('disables comments when the category configuration is incomplete', () => {
  assert.equal(getGiscusConfig({}).enabled, false);
  assert.equal(getGiscusConfig({ NEXT_PUBLIC_GISCUS_CATEGORY: 'Announcements' }).enabled, false);
});
```

- [ ] **Step 3: Run the new tests and verify the expected failure**

Run: `node --test tests/giscus-config.test.mjs`

Expected: FAIL because `src/lib/giscus-config.mjs` does not exist.

- [ ] **Step 4: Implement configuration normalization**

Create `src/lib/giscus-config.mjs`:

```js
const DEFAULT_REPO = 'yuyuyudlc/blog';
const DEFAULT_REPO_ID = 'R_kgDOTI2hng';

export function getGiscusConfig(env = process.env) {
  const repo = env.NEXT_PUBLIC_GISCUS_REPO?.trim() || DEFAULT_REPO;
  const repoId = env.NEXT_PUBLIC_GISCUS_REPO_ID?.trim() || DEFAULT_REPO_ID;
  const category = env.NEXT_PUBLIC_GISCUS_CATEGORY?.trim() || '';
  const categoryId = env.NEXT_PUBLIC_GISCUS_CATEGORY_ID?.trim() || '';

  return {
    repo,
    repoId,
    category,
    categoryId,
    enabled: Boolean(repo && repoId && category && categoryId),
    discussionsUrl: `https://github.com/${repo}/discussions`,
  };
}
```

- [ ] **Step 5: Document the public environment variables**

Add `!.env.example` after the `.env*` rule in `.gitignore`, then create `.env.example`:

```dotenv
NEXT_PUBLIC_GISCUS_REPO=yuyuyudlc/blog
NEXT_PUBLIC_GISCUS_REPO_ID=R_kgDOTI2hng
NEXT_PUBLIC_GISCUS_CATEGORY=
NEXT_PUBLIC_GISCUS_CATEGORY_ID=
```

- [ ] **Step 6: Run the focused tests**

Run: `node --test tests/giscus-config.test.mjs`

Expected: 2 tests pass, 0 fail.

- [ ] **Step 7: Commit the configuration unit**

```powershell
git add .gitignore .env.example src/lib/giscus-config.mjs tests/giscus-config.test.mjs
git commit -m "feat: add giscus comment configuration"
```

---

### Task 2: Theme-Aware Giscus Client Component

**Files:**
- Create: `src/components/giscus-comments.js`
- Create: `tests/giscus-ui.test.mjs`
- Modify: `package.json`
- Modify: `package-lock.json`

**Interfaces:**
- Consumes: the serializable object returned by `getGiscusConfig(env)`.
- Produces: `GiscusComments({ config })`, a client component that renders a `.post-comments` section.

- [ ] **Step 1: Install the official React wrapper**

Run: `npm install @giscus/react`

Expected: `package.json` and `package-lock.json` contain `@giscus/react`.

- [ ] **Step 2: Write the failing component contract tests**

Create `tests/giscus-ui.test.mjs` with tests that read `src/components/giscus-comments.js` and assert these exact contracts:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const componentUrl = new URL('../src/components/giscus-comments.js', import.meta.url);

test('uses the official Giscus component with the selected blog behavior', async () => {
  const source = await readFile(componentUrl, 'utf8');
  assert.match(source, /'use client'/);
  assert.match(source, /from '@giscus\/react'/);
  assert.match(source, /mapping="pathname"/);
  assert.match(source, /strict="1"/);
  assert.match(source, /reactionsEnabled="1"/);
  assert.match(source, /inputPosition="top"/);
  assert.match(source, /lang="zh-CN"/);
  assert.match(source, /loading="lazy"/);
});

test('tracks the document theme and keeps an unconfigured fallback', async () => {
  const source = await readFile(componentUrl, 'utf8');
  assert.match(source, /MutationObserver/);
  assert.match(source, /data-theme/);
  assert.match(source, /评论暂未启用/);
  assert.match(source, /config\.discussionsUrl/);
});
```

- [ ] **Step 3: Run the component tests and verify the expected failure**

Run: `node --test tests/giscus-ui.test.mjs`

Expected: FAIL because `src/components/giscus-comments.js` does not exist.

- [ ] **Step 4: Implement the focused client component**

Create `src/components/giscus-comments.js`:

```jsx
'use client';

import Giscus from '@giscus/react';
import { useEffect, useState } from 'react';

function readTheme() {
  if (typeof document === 'undefined') return 'preferred_color_scheme';
  return document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
}

export default function GiscusComments({ config }) {
  const [theme, setTheme] = useState('preferred_color_scheme');

  useEffect(() => {
    const root = document.documentElement;
    const syncTheme = () => setTheme(readTheme());
    const observer = new MutationObserver(syncTheme);
    syncTheme();
    observer.observe(root, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

  return (
    <section className="post-comments" aria-labelledby="comments-title">
      <div className="post-comments-heading">
        <span className="post-comments-label">Discussion</span>
        <h2 id="comments-title">评论</h2>
        <p>欢迎交流文章中的想法与问题，评论由 GitHub Discussions 提供支持。</p>
      </div>

      {config.enabled ? (
        <Giscus
          id="comments"
          repo={config.repo}
          repoId={config.repoId}
          category={config.category}
          categoryId={config.categoryId}
          mapping="pathname"
          strict="1"
          reactionsEnabled="1"
          emitMetadata="0"
          inputPosition="top"
          theme={theme}
          lang="zh-CN"
          loading="lazy"
        />
      ) : (
        <p className="post-comments-fallback">
          评论暂未启用。仓库 Discussions 配置完成后会在此显示；也可以前往
          {' '}<a href={config.discussionsUrl}>GitHub Discussions</a>。
        </p>
      )}
    </section>
  );
}
```

- [ ] **Step 5: Run the focused component tests**

Run: `node --test tests/giscus-ui.test.mjs`

Expected: 2 tests pass, 0 fail.

- [ ] **Step 6: Commit the client component**

```powershell
git add package.json package-lock.json src/components/giscus-comments.js tests/giscus-ui.test.mjs
git commit -m "feat: add theme-aware giscus component"
```

---

### Task 3: Article Integration and Responsive Presentation

**Files:**
- Modify: `src/app/posts/[slug]/page.js`
- Modify: `src/app/globals.css`
- Modify: `tests/giscus-ui.test.mjs`

**Interfaces:**
- Consumes: `getGiscusConfig()` and `GiscusComments({ config })` from Tasks 1 and 2.
- Produces: a styled comment section after `.post-article-footer` on every valid article page.

- [ ] **Step 1: Extend the failing UI contract**

Append tests that assert:

```js
test('renders comments after the article footer on article pages', async () => {
  const source = await readFile(new URL('../src/app/posts/[slug]/page.js', import.meta.url), 'utf8');
  assert.match(source, /getGiscusConfig/);
  assert.match(source, /GiscusComments/);
  assert.ok(source.indexOf('<GiscusComments') > source.indexOf('post-article-footer'));
});

test('keeps the comment iframe responsive', async () => {
  const css = await readFile(new URL('../src/app/globals.css', import.meta.url), 'utf8');
  assert.match(css, /\.post-comments\s*\{[^}]*min-width:\s*0/s);
  assert.match(css, /\.post-comments\s+\.giscus[^}]*width:\s*100%/s);
});
```

- [ ] **Step 2: Run the UI tests and verify the expected failure**

Run: `node --test tests/giscus-ui.test.mjs`

Expected: the two new article/CSS tests fail.

- [ ] **Step 3: Integrate the comment component into the article page**

Import `GiscusComments` and `getGiscusConfig`, create `const commentsConfig = getGiscusConfig();` after the post is validated, and render:

```jsx
<GiscusComments config={commentsConfig} />
```

immediately after `</footer>` for `.post-article-footer`.

- [ ] **Step 4: Add responsive blog-native styles**

Append focused styles using existing tokens:

```css
.post-comments {
  min-width: 0;
  margin-top: 56px;
  padding-top: 32px;
  border-top: 1px solid var(--border-color);
}

.post-comments-heading {
  margin-bottom: 24px;
}

.post-comments-label {
  color: var(--accent-color);
  font-family: var(--font-mono);
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.post-comments h2 {
  margin: 8px 0;
  font-family: var(--font-serif);
  font-size: clamp(1.5rem, 4vw, 2rem);
}

.post-comments-heading p,
.post-comments-fallback {
  color: var(--text-muted);
  font-size: 0.9rem;
  line-height: 1.7;
}

.post-comments .giscus,
.post-comments .giscus-frame {
  width: 100%;
  min-width: 0;
}

.post-comments-fallback a {
  color: var(--accent-color);
  text-decoration: underline;
  text-underline-offset: 3px;
}
```

- [ ] **Step 5: Run focused and full verification**

Run:

```powershell
node --test tests/giscus-ui.test.mjs
npm test
npm run lint
npm run build
git diff --check
```

Expected: all commands exit 0.

- [ ] **Step 6: Commit article integration**

```powershell
git add src/app/posts/[slug]/page.js src/app/globals.css tests/giscus-ui.test.mjs
git commit -m "feat: show giscus comments on articles"
```

---

### Task 4: Enable GitHub Discussions and Complete Runtime Configuration

**Files:**
- Create locally only: `.env.local`

**Interfaces:**
- Consumes: the GitHub repository settings, Giscus App installation page, and Giscus-generated category configuration.
- Produces: an enabled Discussions repository, an installed Giscus App, and valid local `NEXT_PUBLIC_GISCUS_CATEGORY*` values.

- [ ] **Step 1: Open the repository Settings page in the user's signed-in browser**

Navigate to `https://github.com/yuyuyudlc/blog/settings` and verify the repository General page is accessible. If GitHub requires authentication, ask the user to sign in and resume.

- [ ] **Step 2: Ask for action-time confirmation**

Immediately before changing the repository setting, state that the next action will enable GitHub Discussions on `yuyuyudlc/blog`; immediately before app installation, state that Giscus will receive repository Discussions read/write access. Do not click either final control without confirmation.

- [ ] **Step 3: Enable Discussions and install Giscus**

Enable the Discussions feature in repository settings, then install the official Giscus App only for `yuyuyudlc/blog`.

- [ ] **Step 4: Obtain the Discussion category values**

Open `https://giscus.app/zh-CN`, configure repository `yuyuyudlc/blog`, mapping `pathname`, strict matching, an announcements-type category, reactions, top input, lazy loading, Chinese, and theme following the site. Record the generated category name and category ID; never copy browser cookies or OAuth tokens.

- [ ] **Step 5: Add local public configuration**

Using `apply_patch`, create `.env.local` by copying the four exact `data-repo`, `data-repo-id`, `data-category`, and `data-category-id` values generated in Step 4 into their matching `NEXT_PUBLIC_GISCUS_*` names. Do not copy the script URL, cookies, access tokens, or any other browser state.

Restart the Next.js dev server because public environment variables are embedded at startup.

- [ ] **Step 6: Browser verification**

Open one real article at desktop width and one at 390px width. Verify the Chinese comment section loads, no horizontal scrolling appears, switching the site theme updates Giscus without reloading, and the article remains readable if the Giscus request is blocked.

- [ ] **Step 7: Final verification report**

Run `npm test`, `npm run lint`, and `npm run build` once more after configuration. Report the exact pass counts and note that posting a real comment remains a user-controlled GitHub action unless the user explicitly chooses to test it.
