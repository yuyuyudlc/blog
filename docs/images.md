# 照片发布

把图片放入项目根目录 `photo/`，在提交 Git 前执行：

```bash
npm run photos:publish
```

成功后，`posts/` 中只留下包含图床链接和元数据的 Markdown，本地输入图片会被删除。网站沿用文章的流程：读取 MD、转换成对象、交给照片组件展示。开发启动和构建都不会上传图片。

## 自动填写的内容

- 标题：原图片文件名去掉扩展名。
- 日期：EXIF 拍摄日期，保留拍摄时的日历日期，不使用上传日期或文件修改日期代替。
- 地点：优先使用图片中已有的地点文字，否则使用 EXIF GPS 和本地离线城市数据库推断。没有地点时省略；城市级结果不代表具体景点。
- `coverImage`：PICUI 返回的 HTTPS 原图链接。
- `coverAlt`：图片标题，可在生成后编辑。
- `coverWidth`、`coverHeight`：图片尺寸，考虑 EXIF 旋转方向。
- `photoHash`：原文件的 SHA-256，用来判断是否已发布。
- `photoMd5`：用于核对 PICUI 账户中的已有图片。

缺少日期时会停止发布并保留输入图片，补充或修正日期后再运行：

```bash
npm run photos:publish -- --date=2026-10-26
npm run photos:publish -- --date=2026-10-26 "--location=京都 · 鸭川"
```

这些手动参数应用于本次待发布的图片。需要分别填写时，每次只在 `photo/` 中放入对应图片。支持 JPG、PNG、WebP、GIF、AVIF；其他格式请先导出为支持的格式。

大于图床单张限制的 JPEG 可以先执行 `npm run photos:prepare -- "photo/照片.jpg"`：默认按比例缩小到长边不超过 4000px、保留 EXIF，尝试高质量 JPEG 编码至 20 MiB 以下；需要保留像素尺寸时加 `--max-edge=0`。原始文件经 SHA-256 校验后备份在仓库旁的 `<仓库名>-originals/`，`photo/` 中替换为发布副本。随后正常执行发布命令，上传并校验的是发布副本，删除的也是发布副本，仓库外原图会保留。该步骤需要显式运行，不会自动处理原图。

默认上传大小上限为 20 MiB，超限会在请求前报错；账号实际限额不同时可在私有环境中调整 `PICUI_MAX_FILE_MB`。

## 哈希与删除顺序

1. 计算原文件 SHA-256，与已发布照片 MD 中的 `photoHash` 比较。
2. 相同内容直接复用已有 MD 和链接，即使文件改名也不会重传；已有标题、日期、正文修改都保留。同名但不同内容会生成独立记录。
3. 对新图片先检查 PICUI 的 MD5；云端已有相同文件时复用，否则上传。中断信息及时保存到本地 `.photo-publish/`，重试前会核对云端文件。
4. 下载图床原图，确认可访问且 SHA-256 与本地一致。
5. 完整保存 MD，再重新核对 MD 和本地文件未被修改，最后删除对应输入图片。

上传失败、外链不可访问、哈希不一致、保存 MD 失败，或发布期间原图被修改，都不会删除输入图片。新上传的文件在重试时会复用。若处理多张图片中途失败，前面已经成功发布的 MD 和删除结果保留，修复问题后重新运行即可。

图床如果重新压缩或修改原图字节，SHA-256 会不一致，脚本会保留本地文件并停止，而不会在未经验证时删除。

## Git 与构建检查

只提交 `posts/` 中生成的照片 MD 和代码。原图成功发布后会被删除，不依靠 Git 忽略来隐藏。`.photo-publish/` 中只有恢复记录，不保存图片，也不提交到 Git。

`npm install` 会在本仓库没有其他 hooks 配置时启用提交检查；也可以执行 `npm run photos:hooks`。检查会阻止暂存的 `photo/`、`public/photos/` 图片，以及缺少 HTTPS 图片链接、有效日期或 SHA-256 的照片 MD。它只检查，不替你上传或修改暂存区。发布后需要正常执行 `git add` 更新暂存区。

`npm run photos:check` 检查工作目录，`npm run build` 会自动先运行该检查。远端只需要 MD 与代码，不需要本地照片、上传 token 或生成的 JSON 索引。

## PICUI 配置

token 放在 Git 忽略的 `.env.local` 中，变量名为 `PICUI_TOKEN`，不得带 `NEXT_PUBLIC_` 前缀。验证账号：

```bash
npm run image:upload -- --check
```

本机无法直连 API 时，已支持通过私有配置 `PICUI_TRANSPORT=ssh` 转发，使用 `PICUI_SSH_HOST`、`PICUI_SSH_USER`、`PICUI_SSH_PASSWORD`、`PICUI_SSH_FINGERPRINT`。转发需要 Python 与 paramiko，并校验服务器指纹；这些连接信息不进入 MD、仓库或浏览器代码。

`npm run image:upload -- "路径.jpg"` 仍可用于文章配图，但该命令只上传并返回链接，不生成照片 MD，也不删除图片。

当前允许的图床路径在 `src/config/images.mjs` 中，若 PICUI 更换存储策略或域名，需要根据返回的真实链接更新。

接口依据：[PICUI 官方 API 文档](https://picui.cn/page/api-docs.html)。元数据与离线地点解析依据：[ExifTool Geolocation](https://exiftool.org/geolocation.html)。
