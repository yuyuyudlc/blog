---
title: AI 图像渲染示例
category: AI
date: June 30, 2026
tags: [AI, Image, Markdown]
summary: A compact sample entry for checking how images, captions, and surrounding Markdown content render in the journal layout.
coverImage:
coverAlt: AI 界面渲染预览
---

This entry is a rendering sample for image-heavy notes. The image below is referenced with plain Markdown syntax, so authors can keep writing posts without using custom React components.

![AI interface preview](/ai-interface-preview.svg)

_A static preview asset rendered from the public folder._

## Why keep images simple

Markdown image syntax is enough for most posts. The important part is giving images a stable visual container so large assets do not stretch the article column or cause layout shift.

```javascript
const imagePolicy = {
  source: "/public",
  layout: "article-width",
  rendering: "static",
};
```

For longer technical notes, images can sit between paragraphs, code blocks, and blockquotes while still matching the same border language as the rest of the journal.
