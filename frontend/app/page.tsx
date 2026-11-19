"use client"

import { FormEvent, useEffect, useRef, useState } from 'react'
import { ArrowUpRight, CircleCheck, Send, ShieldCheck } from 'lucide-react'
import { demoAnswers, evidence, EvidenceId, findDemoAnswer } from './demo-data'
import LivePortfolio from './live-portfolio'
import { featuredProjects } from './featured-projects'

type Message = { role: 'user' | 'assistant'; text: string; sources?: EvidenceId[] }
const asset = (file: string) => `${process.env.NEXT_PUBLIC_BASE_PATH || ''}/${file}`

export default function Home() {
  // Opt-in for local development only; the Pages workflow forces static mode.
  return process.env.NEXT_PUBLIC_DEMO_MODE === 'live' ? <LivePortfolio /> : <StaticPortfolio />
}

function StaticPortfolio() {
  const [question, setQuestion] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [selected, setSelected] = useState<EvidenceId | null>(null)
  const [matched, setMatched] = useState<boolean | null>(null)
  const dialog = useRef<HTMLDialogElement>(null)
  const returnFocus = useRef<HTMLElement | null>(null)
  const conversation = useRef<HTMLDivElement>(null)

  useEffect(() => { if (selected) dialog.current?.showModal() }, [selected])
  useEffect(() => { if (conversation.current) conversation.current.scrollTop = conversation.current.scrollHeight }, [messages])
  const openEvidence = (id: EvidenceId) => { returnFocus.current = document.activeElement as HTMLElement; setSelected(id) }
  const answer = (value: string) => {
    if (!value.trim()) return
    const result = findDemoAnswer(value)
    setMatched(Boolean(result))
    setMessages(items => [...items, { role: 'user', text: value.trim() }, {
      role: 'assistant',
      text: result?.answer || '这个问题超出了当前预置演示的范围。我不会用相近内容编造答案。可以从下方 10 个工程问题中选择，也可以查看架构与公开证据。',
      sources: result?.sources,
    }])
    setQuestion('')
  }
  const submit = (event: FormEvent) => { event.preventDefault(); answer(question) }

  return <main>
    <nav className="nav" aria-label="主导航"><a className="brand" href="#top"><span className="brand-mark">明</span> 明林 / PROJECT COPILOT</a><div className="nav-links"><a href="#projects">项目</a><a href="#evidence">工程证据</a><a href="#ask">问答演示</a><a href="#contact">关于</a></div></nav>
    <section className="hero" id="top">
      <div className="hero-copy-block"><div className="eyebrow">AI APPLICATION ENGINEER · OPEN PORTFOLIO</div><h1>把项目经验，<br/><em>变成可验证的答案。</em></h1><p className="hero-copy">一个面向技术面试的工程作品集。了解项目背景、架构与实现取舍，通过公开证据继续追问。</p><div className="actions"><a className="primary" href="#ask">体验问答 <ArrowUpRight size={16}/></a><a className="secondary" href="#projects">查看项目 <ArrowUpRight size={16}/></a></div><div className="hero-meta"><span><CircleCheck size={15}/> 工程说明附来源</span><span><ShieldCheck size={15}/> 无需登录 · 无需 API 密钥</span></div></div>
      <div className="hero-chat"><div className="chat-head"><span><b className="status-dot"/> 明林项目助手</span><span className="chat-status">静态演示</span></div><div className="terminal-body"><p className="muted">预置问答示例 · 非实时模型生成</p><p><i>question</i> 为什么使用混合检索？</p><p>关键词召回精确匹配专有名词，向量召回补充语义表达，再用 RRF 合并排序。</p><button className="citation-link" onClick={() => openEvidence('retrieval')}>查看来源 · hybrid_search ↗</button><div className="hero-example-action"><a className="secondary" href="#ask">浏览 10 个工程问题 <ArrowUpRight size={16}/></a></div></div></div>
    </section>
    <section className="section" id="projects"><div className="eyebrow">SELECTED WORK</div><h2>两个场景，两种 Agent 实践。</h2><p className="muted">从数据查询到售后工单，把检索、工具调用与人工审核放进具体业务流程。这里展示项目介绍与源码，实际运行需部署各自的服务。</p><div className="project-grid">
      {featuredProjects.map(project => <article className="project" key={project.id} id={project.id}><span className="index">{project.label}</span><h3>{project.title}</h3><p className="project-subtitle">{project.subtitle}</p><p>{project.description}</p><ul className="project-highlights">{project.highlights.map(item => <li key={item}>{item}</li>)}</ul><div className="proof">{project.stack}</div><details className="project-details"><summary>展开项目流程与工程要点</summary><p className="project-flow">{project.flow}</p><p>{project.engineering}</p><small>说明依据：{project.source}</small></details><a className="text-link" href={project.repository} target="_blank" rel="noreferrer">查看 GitHub 源码 <ArrowUpRight size={15}/></a></article>)}
    </div></section>
    <section className="evidence" id="evidence"><div><div className="eyebrow">ENGINEERING EVIDENCE</div><h2>每个说明，<br/>都能继续追溯。</h2><p>这些摘要对应仓库中的具体模块。此页面不展示未经确认的业务收益、个人贡献比例或生产测试通过率。</p><a className="text-link" href={asset('evidence/project-notes.md')}>阅读公开工程说明 <ArrowUpRight size={15}/></a></div><div className="evidence-list">{(Object.keys(evidence) as EvidenceId[]).map(id => <button key={id} onClick={() => openEvidence(id)}><span>{evidence[id].title}</span><small>{evidence[id].location}</small><ArrowUpRight size={16}/></button>)}</div></section>
    <section className="section architecture" id="architecture"><div className="eyebrow">SYSTEM ARCHITECTURE</div><h2>浏览器里的展示，服务端的能力。</h2><p className="muted">图中下半部分为本地完整版本；本静态站不连接这些后端服务。</p><a href={asset('evidence/architecture.svg')} target="_blank" rel="noreferrer" aria-label="在新窗口查看完整系统架构图"><img src={asset('evidence/architecture.svg')} width="1040" height="540" alt="公开静态站只在浏览器内匹配预置问答；完整本地版本由 Next.js 调用 FastAPI，再连接 DeepSeek、MySQL、Redis、Qdrant 和 FastEmbed。"/></a></section>
    <section className="ask" id="ask"><div className="eyebrow">ASK THE PROJECT</div><h2>从一个工程问题开始。</h2><p>静态演示通过关键词匹配 10 个预置回答，内容不由模型实时生成。输入只保留在当前页面，刷新后清空。</p><div className="chat"><div className="chat-head"><span><b className="status-dot"/> 明林项目助手</span><span className="chat-status">静态演示 · 预置问答</span></div><div className="stream-events" aria-label="演示匹配状态"><span>{matched === null ? '等待选择问题' : matched ? '本地匹配完成 · 非真实检索' : '无匹配 · 不编造回答'}</span></div><div className="chat-body" ref={conversation} role="log" aria-live="polite" aria-label="项目问答记录">{messages.length === 0 && <div className="empty">选择下方问题，或输入“混合检索”“SSE”“隐私”等关键词。</div>}{messages.map((message, index) => <div className={`bubble ${message.role}`} key={index}><small>{message.role === 'user' ? '你' : '预置回答'}</small>{message.text}{message.sources?.map(id => <button className="citation-link" key={id} onClick={() => openEvidence(id)}>来源 · {evidence[id].title} ↗</button>)}</div>)}</div><form className="chat-form" onSubmit={submit}><label className="sr-only" htmlFor="demo-question">输入项目问题</label><textarea id="demo-question" value={question} maxLength={1200} onChange={event => setQuestion(event.target.value)} placeholder="输入关于项目的问题…" rows={2}/><button type="submit" title="发送" aria-label="发送问题" disabled={!question.trim()}><Send size={16}/></button></form></div><div className="question-toolbar"><span>10 个预置问题</span><button disabled={messages.length === 0} onClick={() => { setMessages([]); setMatched(null) }}>清空对话</button></div><div className="suggestions question-list">{demoAnswers.map((item, index) => <button key={item.id} onClick={() => answer(item.question)}><span>{String(index + 1).padStart(2, '0')}</span>{item.question}</button>)}</div></section>
    <footer id="contact"><p>© 2026 明林项目面试助手</p><p>静态作品集 · 公开工程说明 · 预置问答</p><a className="text-link" href="#top">返回顶部 ↑</a></footer>
    <dialog className="evidence-dialog" ref={dialog} onClick={event => { if (event.target === dialog.current) dialog.current?.close() }} onClose={() => { setSelected(null); returnFocus.current?.focus() }} aria-labelledby="evidence-title">{selected && <><button className="dialog-close" onClick={() => dialog.current?.close()} aria-label="关闭证据详情">×</button><div className="eyebrow">PUBLIC ENGINEERING NOTE</div><h3 id="evidence-title">{evidence[selected].title}</h3><p>{evidence[selected].content}</p><small>{evidence[selected].location}</small><p><a className="text-link" href={asset('evidence/project-notes.md')}>阅读完整公开说明 ↗</a></p></>}</dialog>
  </main>
}
