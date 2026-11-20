# Frontend · 静态作品集

默认启动无需后端的作品集：10 个预置问答、可展开的工程证据和系统架构图。输入只保存在页面内存，刷新清空，不调用真实 AI。

Windows CMD：

```cmd
cd /d D:\OPEN_TOOLS\project_interview_copilot\frontend
npm ci
npm run dev
```

浏览 `http://localhost:3000`。`npm run build` 导出 `out`；`npm start` 仅适用于 Next 服务端构建，不能用于预览静态导出。

生产导出预览（Python 已安装时）：

```cmd
npm run build
python -m http.server 4173 --bind 127.0.0.1 --directory out
```

静态内容维护：`app/demo-data.ts`（问答与证据）、`public/evidence/project-notes.md`（公开说明）、`public/evidence/architecture.svg`（架构图）。页面和数据不能导入后端配置或原始简历。

作品集界面：`app/page.tsx` 组织首页；`app/portfolio-components.tsx` 维护导航、徽章、分区标题、项目卡片与首屏概览；`app/portfolio.css` 提供作用于 `.portfolio` 的颜色、排版、按钮和响应式样式，避免影响保留的本地在线界面。设计参考 shadcn/ui 的组件组合方式，当前没有安装完整 shadcn/Tailwind 依赖。项目资料在 `app/featured-projects.ts` 维护，流程图为明确标注的示意，不是产品截图。

项目问答来源在 `app/project-qa.ts` 维护：Query Pilot、售后工单 Copilot 各 6 个公开 README 摘要问答，本站助手复用 `demo-data.ts` 的 10 个问答，共 22 个。初始不选择来源，必须先选项目；切换时清空输入与对话。关键词仅在当前来源内匹配，引用弹窗链接到对应项目 README 或本站公开工程说明，不跨来源回退。

手机端导航支持展开、选择与 Esc 关闭；预置问题会将回答滚动到可见位置。问答输入支持 Enter 发送、Shift + Enter 换行，并避开中文输入法组合态。使用 `node scripts/smoke-static.cjs` 可回归主要交互（需环境中提供 Playwright），设置 `TEST_SITE_URL` 可检查公网版本。

仅在本机恢复原有在线界面：

```cmd
set NEXT_PUBLIC_DEMO_MODE=live
set NEXT_PUBLIC_API_URL=http://localhost:8000
npm run dev
```

该入口保留原有本地行为，未完成公网鉴权改造。恢复默认前先关闭开发进程，然后执行 `set NEXT_PUBLIC_DEMO_MODE=`。模式与路径是构建时配置，修改后需重启或重新构建。

完整发布步骤与仓库子路径验证见 `../docs/github-pages.md`。
