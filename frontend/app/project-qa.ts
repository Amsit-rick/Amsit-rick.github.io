import { demoAnswers, evidence, findDemoAnswer } from './demo-data'
import { featuredProjects } from './featured-projects'

export type SourceNote = { title: string; location: string; content: string; url?: string }
export type ProjectAnswer = { id: string; question: string; keywords: string[]; answer: string; sources: string[] }
export type ProjectScope = { id: string; name: string; description: string; placeholder: string; answers: ProjectAnswer[]; notes: Record<string, SourceNote> }

const query = featuredProjects[0]
const service = featuredProjects[1]
const note = (project: typeof query, heading: string, content: string): SourceNote => ({ title: `${project.title} · ${heading}`, location: `README.md · ${heading}`, content, url: `${project.repository}/blob/main/README.md` })

export const projectScopes: ProjectScope[] = [
  {
    id: 'query-pilot', name: 'Query Pilot', description: '自然语言数据查询与分析', placeholder: '试试“SQL 安全”“Schema 召回”或“任务恢复”…',
    notes: {
      'query-overview': note(query, 'Query Pilot 是什么', query.description + ' 技术栈：' + query.stack + '。'),
      'query-safety': note(query, 'SQL 安全与成本治理', '模型只生成候选 SQL。执行由身份权限、Schema 白名单、SQLGlot AST、参数绑定、EXPLAIN 成本门禁、人工审批与只读 Data Gateway 共同约束。'),
      'query-retrieval': note(query, '大规模 Schema 与关系召回', '先按权限过滤 Schema，再用 BM25、可插拔 Embedding、业务指标与字段值进行混合召回；关系图补齐桥接表与候选 JOIN 路径。'),
      'query-tasks': note(query, 'Durable Agent 与多轮分析', 'DataTask 保存任务、步骤、事件和结果资产，支持请求幂等、Checkpoint、恢复租约和 fencing token。每轮重新执行权限、安全、成本与审批策略。'),
    },
    answers: [
      { id: 'goal', question: 'Query Pilot 解决了什么问题？', keywords: ['解决', '目标', '介绍', '用途'], answer: 'Query Pilot 将自然语言问题转成受控 SQL 查询，交付答案、表格、图表和 CSV。它围绕 Schema 召回、执行前安全校验与任务持久化构建分析工作台，而不只输出一段 SQL。', sources: ['query-overview'] },
      { id: 'stack', question: 'Query Pilot 使用了哪些技术？', keywords: ['技术', '框架', '架构', 'fastapi'], answer: '前端使用 Vue 3，后端使用 FastAPI。LangChain 适配模型与结构化 SqlPlan，LangGraph 编排生成、校验、执行与有界修复；SQLGlot 用于 SQL AST 安全校验。', sources: ['query-overview', 'query-safety'] },
      { id: 'safety', question: '如何防止危险或越权 SQL？', keywords: ['sql', '安全', '越权', '危险', '权限', '审批', '成本'], answer: '模型不拥有数据库执行权。候选 SQL 需通过 SQLGlot AST、授权表字段白名单、参数绑定、只读限制和 EXPLAIN 成本门禁；高风险请求进入人工审批。执行由受控 Data Gateway 完成。', sources: ['query-safety'] },
      { id: 'schema', question: '大量表和复杂 JOIN 如何召回？', keywords: ['schema', '召回', 'join', '关系', '检索', '表'], answer: '先按账号权限过滤，再混合召回表、字段、业务指标和字段值。关系图结合数据库主外键与人工关系目录，补齐桥接表和候选 JOIN 路径，避免把全部 Schema 塞进 Prompt。', sources: ['query-retrieval'] },
      { id: 'tasks', question: '中断恢复与多轮分析怎么实现？', keywords: ['恢复', '中断', '任务', '多轮', '历史', '持久化'], answer: 'DataTask 持久化步骤、事件与结果资产，结合幂等请求、Checkpoint、恢复租约与 fencing token 控制恢复。多轮上下文采用有界投影，每轮重新校验身份、Schema、权限、安全与成本。', sources: ['query-tasks'] },
      { id: 'results', question: '查询后能得到哪些结果？', keywords: ['结果', '图表', 'csv', '导出', '答案'], answer: '查询可交付自然语言答案、受控 SQL、表格、统计图表与 CSV，并把结果资产保存在任务中供回放和追问。本网站展示的是项目说明，不会实际执行数据库查询。', sources: ['query-overview', 'query-tasks'] },
    ],
  },
  {
    id: 'after-sales-copilot', name: '售后工单 Copilot', description: '电商售后处理与人工审核', placeholder: '试试“政策检索”“风险分级”或“发送门禁”…',
    notes: {
      'service-overview': note(service, '售后工单主线', service.description + ' 技术栈：' + service.stack + '。'),
      'service-facts': note(service, '事实与政策', '从订单/物流适配器补充事实。事实缺失时退回补充信息；政策检索按生效期和适用范围过滤，只使用现行适用政策。'),
      'service-controls': note(service, '动作、风险、审批与发送', '动作、金额与风险由规则决定，模型只辅助文本。L1 出草稿，L2 客服确认，L3 主管审批，L4 转风控；未批准的建议由服务端接口拒绝发送。'),
    },
    answers: [
      { id: 'goal', question: '售后工单 Copilot 解决什么问题？', keywords: ['解决', '目标', '介绍', '用途'], answer: '它围绕售后工单补全订单与物流事实、检索适用政策，生成处理建议与回复草稿，再按风险等级进入人工审核。证据、处理过程和审批记录可追溯。', sources: ['service-overview'] },
      { id: 'stack', question: '售后项目使用了哪些技术？', keywords: ['技术', '框架', '架构', 'fastapi'], answer: '使用 Vue 3、FastAPI 和 LangGraph 组织界面与受控工作流，PostgreSQL / pgvector 支持数据和检索，Redis 支持基础设施能力。模型辅助生成文字，关键业务动作由规则与审批控制。', sources: ['service-overview', 'service-controls'] },
      { id: 'facts', question: '订单事实缺失时如何处理？', keywords: ['事实', '缺失', '订单', '物流', '信息'], answer: '系统从订单和物流适配器获取实付金额、物流状态等事实，并记录失败与缺失。关键事实不足时退回 need_customer_info，要求补信息，不让模型猜测金额或直接推进处理。', sources: ['service-facts'] },
      { id: 'policy', question: '如何避免引用过期售后政策？', keywords: ['政策', '过期', '检索', '引用', '证据'], answer: '检索按政策生效期与适用范围过滤，将过滤下推到存储层，只召回现行且适用的政策。回复与建议建立在订单事实和可定位政策证据之上。', sources: ['service-facts'] },
      { id: 'risk', question: '风险分级和人工审批怎么做？', keywords: ['风险', '分级', '审批', '人工', '金额', '退款'], answer: '动作、金额与风险由规则节点决定，模型只润色文本。L1 直接出草稿，L2 由客服确认，L3 需要主管审批，L4 转风控；风险与审批要求由服务端规则统一定义。', sources: ['service-controls'] },
      { id: 'send', question: '能绕过页面直接发送回复吗？', keywords: ['发送', '门禁', '绕过', '接口', '安全'], answer: '未获批准的建议在服务端接口层被拒绝发送，返回 409，而不是仅隐藏前端按钮。审批与发送门禁共同约束有业务后果的动作。本网站不会实际发送售后回复。', sources: ['service-controls'] },
    ],
  },
  { id: 'portfolio', name: '作品集助手（本站）', description: '检索问答与作品集展示', placeholder: '试试“混合检索”“SSE”或“隐私”…', answers: demoAnswers, notes: evidence },
]

export const allSourceNotes: Record<string, SourceNote> = Object.assign({}, ...projectScopes.map(scope => scope.notes))
export const totalPresetQuestions = projectScopes.reduce((total, scope) => total + scope.answers.length, 0)

export function findProjectAnswer(input: string, scope: ProjectScope): ProjectAnswer | undefined {
  if (scope.id === 'portfolio') return findDemoAnswer(input)
  const question = input.trim().toLowerCase()
  const exact = scope.answers.find(answer => answer.question.toLowerCase() === question)
  if (exact) return exact
  const ranked = scope.answers.map(answer => ({ answer, score: answer.keywords.reduce((score, keyword) => score + (question.includes(keyword) ? keyword.length : 0), 0) })).sort((a, b) => b.score - a.score)
  return ranked[0]?.score >= 2 ? ranked[0].answer : undefined
}
