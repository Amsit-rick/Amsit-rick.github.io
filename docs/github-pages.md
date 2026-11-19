# GitHub Pages 静态演示发布

## 当前交付范围

- 默认页面无需 FastAPI、模型密钥、MySQL、Redis 或 Qdrant。
- 10 个预置问答支持关键词匹配和证据详情；未匹配时明确说明范围限制。
- 问答没有模拟延时或伪造实时执行事件，不代表真实模型结果。
- 展示数据独立维护；没有自动复制候选人配置、简历、架构目录或其他子项目。
- 原有本地在线界面保存在 `frontend/app/live-portfolio.tsx`，显式设置 `NEXT_PUBLIC_DEMO_MODE=live` 可用。公网后端安全改造不属于此阶段。

## 本地预览

Windows CMD：

```cmd
cd /d D:\OPEN_TOOLS\project_interview_copilot\frontend
npm ci
npm run build
python -m http.server 4173 --bind 127.0.0.1 --directory out
```

打开 `http://127.0.0.1:4173`。静态导出不使用 `next start`。

## 选择公开仓库

推荐建立独立的静态作品集仓库，只放 `frontend/` 和 `.github/workflows/pages.yml`，而不是将当前包含大量未提交资料的完整仓库直接公开。前端 CI 的所有依赖均在这两个目录内。

- 仓库名为 `<用户名>.github.io` 时，访问根地址。
- 普通仓库名时，访问 `<用户名>.github.io/<仓库名>/`。
- 工作流通过 `actions/configure-pages` 提供的 `base_path` 自动配置资源前缀，同时兼容两种地址。修改仓库名后重新构建。
- 如果使用自定义域名，先在 Pages 设置中配置后重新运行工作流。

主项目 origin 仍指向 Gitee。2026-11-19 已从独立发布目录 `publish/github-pages` 将审核后的静态前端推送到 `https://github.com/Amsit-rick/Amsit-rick.github.io`。GitHub Pages 使用 Actions，公开站点为 `https://amsit-rick.github.io/`，已观察到成功部署并验证线上问答和引用弹窗。

## 首次发布步骤

1. 确认 GitHub 账号、仓库名和公开展示内容，创建选定的仓库。
2. 将审核后的 `frontend/` 和 `.github/workflows/pages.yml` 放入目标仓库，排除 node_modules、.next、out 和 .env.local。不要整体 `git add .` 当前工作区。
3. 在目标仓库 Settings → Pages 中，将 Source 设为 GitHub Actions。
4. 将所选文件推送到 main，或在 Actions 手动运行 Build and deploy static portfolio。
5. 等待 build / deploy 均成功，使用工作流部署环境提供的实际网址检查。不能把本地构建通过当作线上部署成功。

工作流只上传 `frontend/out`，发布后 main 上相关目录的更新会自动重建。DeepSeek 密钥无需配置，也不能作为 NEXT_PUBLIC_* 变量。

## 手工验证仓库子路径

Windows CMD：

```cmd
cd /d D:\OPEN_TOOLS\project_interview_copilot\frontend
set NEXT_PUBLIC_BASE_PATH=/portfolio-demo
npm run build
set NEXT_PUBLIC_BASE_PATH=
```

产物仍在 out，页面内的脚本和公开资源则应以 `/portfolio-demo/` 开头。普通目录服务器不会自动把 out 挂载到该前缀，可使用下述浏览器检查脚本验证。

## 可重复的浏览器检查

测试依赖 Playwright；可以使用本机现有安装，不加入运行时依赖。在 frontend 目录执行：

```cmd
node scripts/smoke-static.cjs
```

如果使用非标准位置的 Playwright，将 NODE_PATH 指向包含 playwright 的 node_modules。需要浏览器时使用已有 Edge/Chrome 或 Playwright Chromium。

对子路径构建执行：

```cmd
set TEST_BASE_PATH=/portfolio-demo
node scripts/smoke-static.cjs
set TEST_BASE_PATH=
```

脚本启动临时的本机静态服务器，检查全部预置问题、自由输入、拒答、来源弹窗、Esc、清空、刷新、无 API 请求、资源响应和手机布局，并自动关闭服务器与测试浏览器。
