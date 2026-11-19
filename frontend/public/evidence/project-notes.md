# Interview Copilot · 公开工程说明

资料核对日期：2026-11-19。本文件为根据项目源码编写的工程摘要，不是原始简历或生产验收报告。

## 目标与架构

来源：`README.md` 的核心能力与技术栈；`docs/product.md` 的第一版主场景。

项目把个人作品集与项目问答连接起来。本地完整版本采用 Next.js 14、React 18、TypeScript、FastAPI、DeepSeek、MySQL、Redis、Qdrant 和 FastEmbed。

当前 GitHub Pages 版本独立运行于浏览器，展示 10 个预置问题和回答。它不调用真实模型、不执行向量检索、不向服务器发送输入；对话仅保留在页面内存中，刷新清空。

## 混合检索

来源：`backend/app/retrieval.py` 的 `hybrid_search`。

代码先获取关键词结果，再请求 Qdrant；向量查询失败则返回关键词结果。正常路径按 source_id 合并，使用 RRF 分数，关键词路乘以 1.35，并最终保留 public / ready 来源。这里没有提供召回率或排序提升的实测结论。

## 引用约束

来源：`backend/app/policy.py` 的 `normalize_answer` 与 `backend/app/main.py` 的 `load_sources`。

加载公开且就绪的来源；模型返回的 citation_ids 与召回集合校验。当前仍有引用缺失时绑定首条来源的兜底，因此引用存在不能证明每个事实已经验证。

## SSE 边界

来源：`backend/app/main.py` 的 `chat_stream`、`token_chunks` 与 `events`。

当前先生成完整回答，再按 24 字符分块发送 SSE。事件包括 message_start、route、scope、tool_result、citation、token、message_done。尚未实现模型生成一个 token 就立即转发的真实实时流。

## 会话与存储

来源：`README.md` 系统架构与 `backend/app/main.py` 会话接口。

本地版 MySQL 保存会话、消息、引用与执行记录，Redis 限流，Qdrant 保存向量。公开静态版不连接这些基础设施，也不读取任何服务端访客历史。

## 隐私与限制

来源：`docs/security-and-privacy.md`、`backend/scripts/check_privacy.py`、`backend/app/main.py`。

静态展示数据独立维护，不自动导入 backend/profile、简历、其他项目或私有资料。敏感模式扫描只能辅助检查，公开前仍需人工审阅。

现有在线版的会话归属、管理接口鉴权、匿名限流身份尚需完善，不能直接暴露现有本地 API。个人职责比例、业务收益与生产效果未在本演示中声明。
