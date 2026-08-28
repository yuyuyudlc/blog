# Giscus 评论功能设计

## 目标

在每篇文章详情页底部加入由 GitHub Discussions 承载的评论区。访客使用 GitHub 登录后可以发表评论、回复和添加表情；博客本身不新增数据库、登录系统或服务端写接口。

## 已选方案

使用 Giscus，而不是基于 GitHub Issues 的 Utterances 或需要自行维护 OAuth 配置的 Gitalk。

- Giscus 原生支持 Discussions、嵌套回复和 reactions，适合文章讨论。
- 评论数据保存在公开仓库 `yuyuyudlc/blog` 的 Discussions 中。
- 页面与 Discussion 使用 `pathname` 严格映射，使每个 `/posts/{slug}` 对应独立讨论。
- 新讨论放在 announcements 类型的分类中，避免普通访客在仓库里任意创建主题；首次评论时由 Giscus 创建。

## 前置条件

GitHub 仓库目前是公开仓库，但 Discussions 尚未启用。上线前需要：

1. 在 `yuyuyudlc/blog` 的仓库设置中启用 Discussions。
2. 为该仓库安装 Giscus GitHub App。
3. 创建或选择一个 announcements 类型的 Discussion 分类。
4. 从 Giscus 配置页取得 repository ID 与 category ID。

这些 ID 是公开标识，不是密钥。代码通过 `NEXT_PUBLIC_GISCUS_*` 环境变量读取，避免将部署环境绑定在组件实现中。

## 组件与数据流

新增一个客户端组件 `GiscusComments`，只由文章详情页渲染：

1. 服务端文章页负责把评论区放在正文和“文章结束”信息之后。
2. 客户端组件读取公开配置并挂载 Giscus。
3. Giscus 根据当前页面 pathname 查找对应 Discussion；不存在时在首次评论后自动创建。
4. 评论的读取与写入均由 Giscus 和 GitHub 完成，博客服务端不代理用户凭据。

优先使用官方 `@giscus/react` 组件，减少脚本重复注入、路由切换和 iframe 生命周期处理代码。

## 配置

使用以下公开环境变量：

- `NEXT_PUBLIC_GISCUS_REPO=yuyuyudlc/blog`
- `NEXT_PUBLIC_GISCUS_REPO_ID=R_kgDOTI2hng`
- `NEXT_PUBLIC_GISCUS_CATEGORY` 填写选定的 Discussion 分类名
- `NEXT_PUBLIC_GISCUS_CATEGORY_ID` 在启用 Discussions 后从 Giscus 配置页取得

固定行为：

- 映射：`pathname`
- 严格匹配：启用
- 主帖 reactions：启用
- 评论框：放在评论列表上方
- 语言：`zh-CN`
- 加载：lazy
- 元数据事件：关闭

如果配置缺失，开发环境显示一条中文配置提示，生产环境不加载第三方 iframe，也不暴露错误堆栈。

## 主题与视觉

评论区沿用文章正文的最大宽度，使用现有边框、间距、中文无衬线字体和单色标签体系，不增加独立卡片阴影。

Giscus 主题与博客 `data-theme` 同步：

- 浅色博客使用 Giscus light 主题。
- 深色博客使用 Giscus dark 主题。
- 用户通过顶部按钮或快捷键切换主题时，评论 iframe 同步更新，无需刷新页面。

移动端保持单栏，标题、说明和 iframe 不产生横向溢出。

## 异常与隐私

- 第三方脚本加载失败时不影响正文阅读，并保留前往仓库 Discussions 的备用入口。
- 未登录访客仍可浏览公开评论；发表评论时由 Giscus 发起 GitHub OAuth。
- 不保存 GitHub token，不读取用户资料，不在本项目中新增 cookie 或评论数据库。
- iframe 使用 Giscus 官方域名，配置中不包含任何私密凭据。

## 验证

- 单元/契约测试验证评论区只出现在文章页、配置校验、中文参数和 pathname 映射。
- 测试主题切换会把正确的主题属性传给 Giscus 组件。
- 运行现有测试、ESLint 和生产构建。
- 在桌面与移动视口检查评论区间距、横向溢出和主题同步。
- GitHub 前置条件完成后，用一篇文章确认 Discussion 自动创建、评论可提交并能在 GitHub 中管理。

## 非目标

- 不实现匿名评论、访客昵称、邮件通知或本地审核后台。
- 不在首页和分类页显示评论数量。
- 不迁移旧评论，因为当前项目没有既有评论数据。
