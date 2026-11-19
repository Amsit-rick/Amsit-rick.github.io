// Public project summaries, curated from the two project READMEs.
export const featuredProjects = [
  {
    id: 'query-pilot',
    label: '01 · DATA / NL2SQL AGENT',
    title: 'Query Pilot',
    subtitle: '自然语言数据查询与分析工作台',
    description: '用自然语言提出数据问题，生成 SQL 计划，经过权限、安全与成本校验后执行只读查询，再将答案、表格、图表与执行证据保存在可追溯的数据任务中。',
    highlights: ['权限过滤后的 Schema 与关系召回', 'SQLGlot AST 校验、成本门禁与人工审批', '任务持久化、回放与多轮追问'],
    stack: 'Vue 3 · FastAPI · LangGraph · LangChain · SQLGlot',
    flow: '自然语言问题 → Schema 召回 → SQL 计划 → 安全与成本校验 → 只读执行 → 结果与图表',
    engineering: '模型负责生成候选 SQL，确定性的权限校验与只读 Data Gateway 决定能否执行。查询步骤、结果资产与审计信息按任务保存。',
    repository: 'https://github.com/Amsit-rick/QueryPilot',
    source: 'data_query_agent / README.md · Query Pilot 是什么、核心能力',
  },
  {
    id: 'after-sales-copilot',
    label: '02 · SERVICE / MULTI-AGENT',
    title: '电商售后工单智能处理系统',
    subtitle: 'After-sales Ticket Copilot',
    description: '围绕客户售后工单补充订单与物流事实，检索现行适用政策，生成处理建议和回复草稿。通过风险分级与人工审批控制发送，保留证据、处理过程与审计记录。',
    highlights: ['订单事实补全与售后政策检索', '规则控制动作、金额与风险等级', '分级人工审核与服务端发送门禁'],
    stack: 'Vue 3 · FastAPI · LangGraph · PostgreSQL / pgvector · Redis',
    flow: '客户工单 → 订单与物流事实 → 适用政策 → 处理建议与草稿 → 风险分级 → 人工审核',
    engineering: '以受控多 Agent 工作流和证据检索作为底座。动作、金额与风险由规则决定，模型辅助生成文本；未获批准的建议由接口层阻止发送。',
    repository: 'https://github.com/Amsit-rick/product-insight-copilot',
    source: 'deal-risk-agent / README.md · 售后工单主线、架构',
  },
]
