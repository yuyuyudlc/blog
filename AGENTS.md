汤圆## 文章录入规范

创建或编辑博客文章时，必须遵循以下仓库规则：

- 所有文章均以 UTF-8 编码的 Markdown 文件存放在 `posts/` 目录中。
- 文件名使用小写 ASCII 字母和连字符，例如 `my-new-article.md`。文件名会直接生成文章地址 `/posts/my-new-article`。
- 文件开头必须使用以下 Front Matter 结构：

```markdown
---
title: 文章标题
category: 前端
date: 2026-08-29
tags: [React, Next.js, CSS]
summary: 显示在首页和文章列表中的简短摘要，建议控制在一到两句话。
coverImage: /images/my-cover.jpg
coverAlt: 文章封面的文字说明
---
```

- `title`、`category`、`date`、`tags` 和 `summary` 是完整录入一篇文章所需的字段。
- `category` 必须与站点配置中的分类名称完全一致，只能填写 `前端`、`后端`、`AI`、`随记` 或 `photos`。
- `date` 使用 `YYYY-MM-DD` 格式。文章按日期从新到旧排序，日期最新的文章会成为首页置顶文章。
- 不要填写 `readingTime`。程序会清理 Markdown 标记后统计正文可读字符数，按每分钟 400 字符向上取整，并自动显示阅读时间，最少为 1 分钟。
- `tags` 使用 YAML 行内数组，例如 `[React, Next.js, CSS]`。
- `summary` 应保持简洁，因为它会用于文章预览和页面元数据描述。
- `coverImage` 和 `coverAlt` 是可选字段。没有封面时，首页会使用四叠半图形作为视觉回退。
- 文章图片放在 `public/` 中，建议使用含义明确的子目录，例如 `public/images/`。在 Markdown 中引用时不写 `public` 前缀，例如 `![图片说明](/images/article-image.jpg)`。
- 标题、列表、链接、引用、图片和代码块使用标准 GitHub-Flavored Markdown 语法。
- 禁止在文章 Markdown 中直接写入原始 `<script>` 元素。需要展示包含脚本标签的 HTML 或 JavaScript 时，必须放进围栏代码块，避免 React 将其当作可执行页面标签。
- 新增文章后，必须检查首页、对应分类页以及 `/posts/<不含扩展名的文件名>` 是否能够正确渲染。
