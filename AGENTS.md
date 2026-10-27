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
- 文章图片可以使用 PICUI 上传返回的 HTTPS 外链；本地图片放在 `public/` 中，建议使用含义明确的子目录，例如 `public/images/`。引用本地图片时不写 `public` 前缀，例如 `![图片说明](/images/article-image.jpg)`。
- 标题、列表、链接、引用、图片和代码块使用标准 GitHub-Flavored Markdown 语法。
- 禁止在文章 Markdown 中直接写入原始 `<script>` 元素。需要展示包含脚本标签的 HTML 或 JavaScript 时，必须放进围栏代码块，避免 React 将其当作可执行页面标签。
- 新增文章后，必须检查首页、对应分类页以及 `/posts/<不含扩展名的文件名>` 是否能够正确渲染。

## 照片录入规范

照片与文章共用 `posts/` 目录，一张照片对应一个 Markdown 文件：

```markdown
---
title: 鸭川的傍晚
category: photos
date: 2026-10-20
tags: [Photo]
summary: 一句话说明，用于页面元数据描述。
location: 京都 · 鸭川
coverImage: https://cdn.imgos.cn/vip/19936/example.jpg
coverAlt: 傍晚的鸭川河岸
photoHash: 自动生成的64位SHA-256内容哈希
---

（可选）一两句关于这张照片的文字。
```

- `category` 必须填写 `photos`；`coverImage` 是照片本身，必须填写，`coverAlt` 用于无障碍描述。
- 照片发布入口是根目录 `photo/` 中的图片。提交 Git 前运行 `npm run photos:publish`，程序会从文件名生成标题、从 EXIF 提取拍摄日期、从现有地点信息或离线 GPS 城市数据库获取地点，并自动在 `posts/` 中生成 MD。
- `photoHash` 是原始文件内容的 SHA-256。相同内容即使改名也复用原有 MD 和图床链接，不重复上传或创建记录；已有 MD 的手动修改会保留。文件名相同但内容不同会生成不同记录。
- 上传后必须下载外链原图并核对 SHA-256，且将包含链接和元数据的 MD 完整保存后，才会删除本地输入图片；任何步骤失败都保留原图。不要手工填写虚假的哈希。
- 缺少拍摄日期时发布会停止，可用 `npm run photos:publish -- --date=2026-10-26` 补充；地点缺失可以留空，也可以用 `--location=地点` 修正。离线 GPS 结果为城市级近似，不能推断具体街道或景点。
- Git 只提交生成的 MD 与代码，不提交照片原文件；开发启动和构建不再执行上传，也不依赖额外图片 JSON 索引。`.photo-publish/` 仅保存本地中断恢复信息，已被 Git 忽略。构建和 Git 提交检查会阻止遗漏的原图或未发布的照片 MD。
- PICUI token 仅放在 Git 忽略的 `.env.local` 或上传进程的环境变量 `PICUI_TOKEN` 中，不得写入文章、前端代码或提交到仓库。图片录入流程见 `docs/images.md`。
- 照片只出现在分类页 `/category/photos` 的正方形网格中，不会出现在首页“最近文章”、归档和文章的上一篇 / 下一篇中。
- 新增照片后，必须检查 `/category/photos` 与 `/posts/<不含扩展名的文件名>` 是否能够正确渲染。
