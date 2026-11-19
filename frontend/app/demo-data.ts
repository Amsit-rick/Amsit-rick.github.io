// Reviewed engineering summaries only. Never import profile or resume data here.
export const evidence = {
  overview: { title: '项目目标与技术栈', location: 'README.md · 核心能力 / 技术栈；docs/product.md · 第一版主场景', content: '面向技术面试与个人作品集展示的项目问答系统。浏览者可以查看项目背景、架构和工程证据，再向公开资料提问。本地完整版本采用 Next.js、FastAPI、DeepSeek、MySQL、Redis、Qdrant 与 FastEmbed。当前网页为独立静态演示。' },
  retrieval: { title: '混合检索与降级', location: 'backend/app/retrieval.py · hybrid_search', content: '先获取关键词结果，再尝试 Qdrant 向量检索；Qdrant 异常时返回关键词结果。两路结果按 source_id 合并，以 RRF 累加排序分数，关键词路权重为 1.35。最终过滤 visibility=public 且 status=ready 的来源。' },
  citations: { title: '引用约束与回答范围', location: 'backend/app/policy.py · normalize_answer；backend/app/main.py · load_sources', content: '服务端只加载 public 且 ready 的来源。结构化模型回答中的 citation_ids 会与实际召回的 source_id 校验。来源不足时有拒答路径。但当前实现还存在引用缺失时自动绑定首条来源等限制，不能据此宣称每个回答都已经逐事实验证。' },
  streaming: { title: 'SSE 输出的真实边界', location: 'backend/app/main.py · chat_stream / token_chunks / events', content: '后端先完成检索和回答生成，再将答案按 24 字符分块，通过 text/event-stream 发送 message_start、route、scope、tool_result、citation、token 与 message_done 等事件。这是分块 SSE 输出，当前不是模型生成一个 token 就立即转发的实时流。' },
  storage: { title: '会话与基础设施', location: 'README.md · 系统架构；backend/app/main.py · 会话与历史接口', content: '本地版本使用 MySQL 保存会话、消息、引用和执行记录；Redis 用于请求限流；Qdrant 保存向量索引。本静态演示仅把问答保留在当前页面内存，刷新即清空，不读取服务端历史，也不发送输入。' },
  privacy: { title: '公开资料边界', location: 'docs/security-and-privacy.md；backend/scripts/check_privacy.py', content: '公开资料需筛选后发布。仓库包含扫描 JSON 中密钥、邮箱、手机号和身份证号模式的隐私检查脚本，但自动扫描不能替代人工确认。本静态站使用独立编写的工程说明，不打包 backend/profile、原始简历或 new_project。' },
  limits: { title: '当前限制与发布边界', location: 'backend/app/main.py · 会话接口 / executions / chat_stream', content: '现有在线版仍需完善会话归属、管理接口鉴权和匿名限流身份；不能将本地 API 直接作为开放公网服务。此页面只展示预置内容，不运行 DeepSeek、向量检索、数据库或真实 SSE，也不声明完成公网生产验收。' },
}
export type EvidenceId = keyof typeof evidence
export type DemoAnswer = { id: string; question: string; keywords: string[]; answer: string; sources: EvidenceId[] }
export const demoAnswers: DemoAnswer[] = [
  { id: 'goal', question: '这个项目解决了什么问题？', keywords: ['解决', '目标', '背景', '介绍', '用途', '什么项目'], answer: '它把作品集里的项目介绍延伸为可追问的工程说明：访客先了解背景与架构，再通过问答查找公开证据。本地完整版本实现检索与模型生成；这里展示的是无需后端的预置问答。', sources: ['overview'] },
  { id: 'stack', question: '项目用了哪些技术？', keywords: ['技术栈', '技术', '框架', '架构', 'next', 'fastapi'], answer: '前端采用 Next.js 14、React 18 和 TypeScript；本地后端采用 FastAPI，调用 DeepSeek，配合 MySQL、Redis、Qdrant 与 FastEmbed。当前站点只导出前端静态文件，浏览这些内容不需要启动后端。', sources: ['overview', 'storage'] },
  { id: 'retrieval', question: '为什么使用混合检索？', keywords: ['混合检索', '检索', 'rrf', '关键词', '向量', 'qdrant'], answer: '关键词检索适合精确实体和专有名词，向量检索补充语义相近的表达。代码将两路结果按来源合并，用 RRF 排序，并提高关键词路的权重。设计取舍是保留可解释的关键词基线，同时引入语义召回。', sources: ['retrieval'] },
  { id: 'fallback', question: 'Qdrant 不可用时怎么办？', keywords: ['不可用', '降级', '宕机', '故障', '失败', '异常'], answer: 'hybrid_search 捕获向量检索异常后返回关键词结果，避免 Qdrant 故障直接中断检索。这个路径是后端代码能力；本静态演示没有连接 Qdrant，也不把预置结果展示成真实检索。', sources: ['retrieval', 'limits'] },
  { id: 'citation', question: '回答引用如何校验？', keywords: ['引用', '出处', '证据', '幻觉', '校验', '拒答'], answer: '服务端对模型返回的 citation_ids 做召回来源集合校验，资料加载也筛选 public / ready。当前代码存在引用缺失时绑定首条来源的兜底，因此“带引用”不等于每个事实已经验证。此处可点击引用查看工程说明和代码位置。', sources: ['citations'] },
  { id: 'sse', question: 'SSE 是真正的模型实时流吗？', keywords: ['sse', '流式', '实时', 'token'], answer: '目前不是模型边生成边转发：后端先拿到完整回答，再按 24 字符分块，通过 SSE 发送给浏览器。它展示了事件协议与分块输出；若要降低首字延迟，还需要接入模型提供方的原生流。', sources: ['streaming'] },
  { id: 'history', question: '会话和历史记录保存在哪里？', keywords: ['历史', '保存', '存储', '会话', 'mysql', 'redis', '数据库'], answer: '本地在线版用 MySQL 保存会话、消息、引用和执行记录，Redis 用于限流。这一静态版本只使用当前页面内存，刷新即清空；输入不会发送到服务器，也不会在不同访客间共享。', sources: ['storage'] },
  { id: 'privacy', question: '如何保护简历和私有资料？', keywords: ['隐私', '私有', '简历', '密钥', '安全', '权限', '公开'], answer: '公开站点使用独立的工程说明数据，不直接导入候选人配置、原始简历或其他项目目录。仓库另有隐私扫描脚本，可辅助发现敏感模式；公开前仍需人工审阅所选文件。DeepSeek 密钥不应放进前端。', sources: ['privacy'] },
  { id: 'work', question: '这个项目可以展示哪些工程工作？', keywords: ['负责', '贡献', '工程工作', '做了什么', '能力'], answer: '可展示的代码包括检索与 RRF 融合、引用校验、SSE 事件、会话持久化、故障降级和隐私检查。它们是仓库中能定位的实现点；个人职责比例、真实业务收益和生产效果需要额外材料确认，这个演示不编造这些结论。', sources: ['overview', 'retrieval', 'citations', 'limits'] },
  { id: 'deploy', question: '这个页面能直接调用真实 AI 吗？', keywords: ['部署', 'github', 'pages', '真实', 'ai', '上线', '模型', '限制'], answer: '当前是静态演示：在浏览器中匹配预置问题并展示写好的回答，不调用模型。真实 AI 需要另行部署后端；接入前应完成会话隔离、鉴权和费用限额等改造。本地原有在线入口仍保留供开发使用。', sources: ['limits', 'storage'] },
]
export function findDemoAnswer(input: string): DemoAnswer | undefined {
  const question = input.trim().toLowerCase()
  const exact = demoAnswers.find(item => item.question.toLowerCase() === question)
  if (exact) return exact
  // Prefer a specific failure question over the generic Qdrant topic.
  if (/qdrant|向量|检索/.test(question) && /不可用|降级|宕机|故障|失败|异常/.test(question)) return demoAnswers.find(item => item.id === 'fallback')
  const ranked = demoAnswers.map(item => ({ item, score: item.keywords.reduce((score, keyword) => score + (question.includes(keyword) ? keyword.length : 0), 0) })).sort((a, b) => b.score - a.score)
  return ranked[0]?.score >= 2 ? ranked[0].item : undefined
}
