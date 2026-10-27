# Ubuntu 服务器部署

博客独立运行在 `127.0.0.1:3100`，由 Nginx 的 `8081` 端口转发，对外地址为 `http://150.109.157.118:8081`。原有网站继续使用 80/443 和内部端口 3000。

- 发布目录：`/opt/tatami-blog/releases/<版本>`，`/opt/tatami-blog/current` 指向当前版本。
- 发布必须经过 Git：本地先发布照片，再将代码与生成的 MD 提交、推送到 `origin/main`。服务器只从该远程仓库获取已推送的完整提交 SHA，不接收本地源码包或未提交改动。服务器不需要照片原文件、PICUI token 或额外图片索引。
- Git 仓库保存在 `/opt/tatami-blog/repository.git`，每次从指定提交创建独立 worktree 发布目录。以 `ubuntu` 身份执行 `bash deploy/deploy.sh <完整提交SHA>`（脚本本身也应来自该提交）。脚本 fetch 后确认提交属于远程 main，运行安装、照片测试、lint 和生产构建，成功后切换 `current`，只重启博客服务；切换后检查失败会自动回滚。
- 首次建立 Git 发布入口：在服务器执行 `git clone --bare https://github.com/yuyuyudlc/blog /opt/tatami-blog/repository.git`。每次发布先 `git --git-dir=/opt/tatami-blog/repository.git fetch origin main`，用 `git --git-dir=/opt/tatami-blog/repository.git show <完整提交SHA>:deploy/deploy.sh` 将脚本保存到 runtime 的临时文件，再以 `bash <临时文件> <同一完整提交SHA>` 执行。这样脚本和源码均可追溯到同一提交。
- `/opt/tatami-blog/runtime/deployment.json` 记录仓库、当前提交、发布时间和上一个版本；构建日志也保存在 runtime。保留失败的构建目录用于排错，不自动删除旧版本。
- 服务配置：[tatami-blog.service](tatami-blog.service)，安装到 `/etc/systemd/system/tatami-blog.service`。
- 代理配置：[tatami-blog.nginx.conf](tatami-blog.nginx.conf)，安装到 `/etc/nginx/conf.d/tatami-blog.conf`；执行 `sudo nginx -t` 通过后再 `sudo systemctl reload nginx`。
- 运行环境变量可放在 `/opt/tatami-blog/runtime/environment`。`NEXT_PUBLIC_` 变量需要在构建时设置才会进入浏览器代码；当前本地未配置的评论功能保持关闭。
- 博客设置了开机自启；查看状态用 `sudo systemctl status tatami-blog`，查看日志用 `sudo journalctl -u tatami-blog -n 100 --no-pager`。
- 回滚时，将 `current` 指向保留的旧版本并执行 `sudo systemctl restart tatami-blog`，然后检查首页、分类页和文章页。
- 腾讯云防火墙或安全组需要放行入站 TCP 8081；内部 3100 端口仅监听本机，无需对公网开放。

首次部署或回滚后，同时检查博客的 8081 端口与原站 HTTPS 访问，确保两个网站均正常。
