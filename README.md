# 四叠半日志 · dev.log Journal

融合 [Zed](https://zed.dev/) 建筑网格体系与《四叠半神话大系》祝仪铺法（T 字接缝、四角不相交）的 Next.js 技术博客。

## 目录结构

- `src/app`：App Router 页面（首页 `/`、分类房间 `/category/[category]`、文章详情 `/posts/[slug]`、归档 `/archive`、404 无限四叠半）
- `src/styles`：按职责拆分的样式系统
  - `tokens.css`：冷色四叠半与 Zed 主题变量、排版与间距比例
  - `base.css`：Reset、键盘按键 `kbd`、按钮原语与焦点状态
  - `layout.css`：5 栏网格骨架、斜线导轨、顶栏、页脚与 6px 菱形节点
  - `tatami.css`：四叠半 Logo、3×3 房间导航、Hero、分类房间头与 404 无限走廊
  - `post-list.css`：置顶行、错位几何线框、Zed changelog 风格列表行、筛选与分页
  - `article.css`：文章侧栏、滚动目录、Zed 代码窗口、引用块与上下篇导航
  - `motion.css`：建筑几何动画与无障碍降级
- `src/components`：单一职责 UI 组件
- `src/hooks`：主题切换（`use-theme`）、全局快捷键（`use-keyboard-shortcuts`）与随机穿越（`use-random-post`）
- `src/lib`：文章数据加载（`posts.js`）、Markdown 渲染与代码窗口（`markdown.js`）、日期格式化（`post-display.mjs`）与分页（`post-pagination.mjs`）
- `src/config/site.js`：站点元数据、导航与四叠半分类房间配置
- `posts`：UTF-8 Markdown 文章目录

## 常用命令

```bash
npm run dev
npm run build
npm run lint
```
