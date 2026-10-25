# 四叠半日志 · dev.log Journal

融合 [Zed](https://zed.dev/) 建筑网格体系与《四叠半神话大系》祝仪铺法（T 字接缝、四角不相交）的 Next.js 技术博客。

## 目录结构

```text
src/
├── app/                      # 仅负责路由：每个 page.js 只从 views 重新导出
├── views/                    # 每个页面一个文件夹
│   └── Post/
│       ├── index.jsx         # 页面组件（含数据加载、metadata）
│       ├── index.css         # 页面级样式
│       └── components/       # 只属于该页面的组件
│           ├── Toc/
│           │   ├── index.jsx
│           │   └── index.css
│           └── index.js      # 统一导出
├── components/               # 跨页面共享的组件（同样是 Name/index.jsx + index.css）
│   └── index.js              # 统一导出，供 views 与 app 使用
├── hooks/                    # 主题、随机文章导航
├── lib/                      # 文章数据、Markdown 渲染、日期与分页
├── config/                   # 站点配置（site.js）
└── styles/                   # 全局样式：tokens.css（设计变量）与 base.css（Reset 与原语）
```

文章是项目根目录 `posts/` 下的 UTF-8 Markdown 文件，录入规范见 `AGENTS.md`。

约定：

- 页面放在 `src/views/<Page>/`，不使用 `src/pages/`（该目录名是 Next.js Pages Router 的保留目录）。
- 组件文件夹内包含 `index.jsx`；有样式时再加 `index.css`，由 `index.jsx` 自行 `import`。
- `src/components/` 内部的组件之间用相对路径互相引用（如 `../TatamiPlan`），不要经由 `@/components` 统一导出，以免循环引用。
- 客户端组件不要引用 `@/lib/posts`（会读取文件系统）；需要分类信息时使用 `@/lib/categories`。

## 设计

像一本印在生成り纸上的文库本，而不是一个应用界面：

- 颜色：生成り纸（背景）、墨（文字）、藍（唯一的强调色，悬停与当前项）、畳缘 `--heri`（四叠半平面图）。
- 字体：宋体承担阅读（标题与正文），黑体只用于日期、计数等小字，等宽字体只用于代码。
- 版面：单栏约 36 字宽，大量留白；不使用边框卡片、侧栏、状态栏等界面部件。
- 界面文字一律平实（文章、分类、上一篇 / 下一篇）；四叠半的比喻只出现在首页的平面图与 404 页。
- 四叠半平面图（`TatamiPlan`）是首页的分类导航；文章前后导航循环，最早一篇之后回到最新一篇。
- 导航、随机文章和主题切换通过页面链接与按钮操作。

## 常用命令

```bash
npm run dev
npm run build
npm run lint
```
