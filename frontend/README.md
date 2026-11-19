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

仅在本机恢复原有在线界面：

```cmd
set NEXT_PUBLIC_DEMO_MODE=live
set NEXT_PUBLIC_API_URL=http://localhost:8000
npm run dev
```

该入口保留原有本地行为，未完成公网鉴权改造。恢复默认前先关闭开发进程，然后执行 `set NEXT_PUBLIC_DEMO_MODE=`。模式与路径是构建时配置，修改后需重启或重新构建。

完整发布步骤与仓库子路径验证见 `../docs/github-pages.md`。
