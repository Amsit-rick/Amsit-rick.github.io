"use client"

import { FormEvent, useEffect, useRef, useState } from 'react'
import { ArrowDown, ArrowRight, ArrowUp, ArrowUpRight, BookOpen, Bot, Braces, FileCode2, Github, Layers3, MessageSquare, Send, ShieldCheck, Trash2, X } from 'lucide-react'
import { demoAnswers, evidence, EvidenceId, findDemoAnswer } from './demo-data'
import LivePortfolio from './live-portfolio'
import { featuredProjects } from './featured-projects'
import { Badge, Navigation, profileUrl, ProjectCard, SectionHeading, WorkbenchPreview } from './portfolio-components'
import './portfolio.css'

type Message = { role: 'user' | 'assistant'; text: string; sources?: EvidenceId[] }
const asset = (file: string) => `${process.env.NEXT_PUBLIC_BASE_PATH || ''}/${file}`
const evidenceIds = Object.keys(evidence) as EvidenceId[]

export default function Home() {
  // The full local API experience remains opt-in; Pages uses the static portfolio.
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
    setMessages(items => [...items, { role: 'user', text: value.trim() }, { role: 'assistant', text: result?.answer || '这个问题超出了当前预置演示的范围。我不会用相近内容编造答案。可以从预置的 10 个工程问题中选择，也可以查看工程笔记。', sources: result?.sources }])
    setQuestion('')
    if (window.matchMedia('(max-width: 760px)').matches) {
      requestAnimationFrame(() => conversation.current?.scrollIntoView({ block: 'center', behavior: 'instant' }))
    }
  }
  const submit = (event: FormEvent) => { event.preventDefault(); answer(question) }

  return <div className="portfolio">
    <a className="skip-link" href="#main-content">跳转到主要内容</a>
    <Navigation/>
    <main id="main-content" tabIndex={-1}>
      <section className="hero-section container" id="top">
        <div className="hero-copy-block"><div className="hero-intro"><span className="tiny-dot"/>明林的工程作品集<span className="mono">PORTFOLIO / 2026</span></div><h1>让 AI 走进<br/><em>真实业务流程<span>。</span></em></h1><p className="hero-copy">你好，我是明林。专注 AI 应用与 Agent 工程，<br className="desktop-break"/>探索从自然语言、业务证据到可控执行的完整链路。</p><div className="hero-actions"><a className="button button-primary" href="#projects">探索精选项目<ArrowDown size={16}/></a><a className="button button-secondary" href="#ask"><MessageSquare size={16}/>体验项目问答</a></div><div className="hero-footnote"><ShieldCheck size={15}/><span>从业务场景出发，以代码与工程说明为依据</span></div></div>
        <WorkbenchPreview/>
      </section>
      <div className="portfolio-overview container"><div className="overview-label"><span className="mono">FOCUS & PRACTICE</span><span>把想法做成可查看的实现</span></div><div className="overview-item"><strong>0{featuredProjects.length}</strong><span>精选业务项目</span></div><div className="overview-item"><strong>{evidenceIds.length.toString().padStart(2, '0')}</strong><span>公开工程笔记</span></div><div className="overview-item"><strong>{demoAnswers.length}</strong><span>可体验的预置问答</span></div><a className="overview-link" href={profileUrl} target="_blank" rel="noreferrer"><Github size={17}/><span>在 GitHub 查看<ArrowUpRight size={13}/></span></a></div>

      <section className="portfolio-section container" id="projects">
        <SectionHeading number="01" label="SELECTED WORK" title="面向真实场景的 Agent 实践。" description="从数据查询到售后工单，探索检索、工具编排与人工审核如何组成可控的业务流程。"><Badge className="section-count">2 个独立项目</Badge></SectionHeading>
        <div className="project-grid">{featuredProjects.map((project, index) => <ProjectCard key={project.id} project={project} index={index}/>)}</div><p className="section-note"><FileCode2 size={14}/>项目介绍与源码公开可查；实际运行需部署对应服务。</p>
      </section>

      <section className="engineering-section" id="evidence"><div className="container">
        <SectionHeading number="02" label="BEHIND THE BUILD" title="好的实现，经得起继续追问。" description="这个作品集助手本身，也是一次工程实践。下面记录它的设计取舍、实现位置和当前边界。"><a className="button button-secondary button-small" href={asset('evidence/project-notes.md')}><BookOpen size={15}/>阅读完整说明<ArrowUpRight size={14}/></a></SectionHeading>
        <div className="engineering-layout"><div className="engineering-context"><div className="context-icon"><Braces size={26} strokeWidth={1.5}/></div><h3>从“做了什么”<br/>到“为什么这样做”。</h3><p>混合检索如何降级？引用如何约束？SSE 的实际边界在哪里？每篇笔记都对应具体模块。</p><div className="context-tags"><Badge>设计取舍</Badge><Badge>代码位置</Badge><Badge>已知限制</Badge></div><a className="inline-link" href="#architecture">查看系统架构<ArrowDown size={14}/></a></div><div className="evidence-list">{evidenceIds.map((id, index) => <button key={id} onClick={() => openEvidence(id)}><span className="evidence-number mono">{String(index + 1).padStart(2, '0')}</span><span className="evidence-item-copy"><strong>{evidence[id].title}</strong><small>{evidence[id].location}</small></span><ArrowUpRight size={17}/></button>)}</div></div>
        <div className="architecture" id="architecture"><div className="architecture-heading"><div><div className="eyebrow">SYSTEM OVERVIEW</div><h3>浏览器里的展示，服务端的能力。</h3></div><Badge><Layers3 size={13}/>作品集助手架构</Badge></div><a className="architecture-image" href={asset('evidence/architecture.svg')} target="_blank" rel="noreferrer" aria-label="在新窗口查看完整系统架构图"><img src={asset('evidence/architecture.svg')} width="1040" height="540" loading="lazy" alt="公开静态站在浏览器内匹配预置问答；完整本地版本由 Next.js 调用 FastAPI，再连接 DeepSeek、MySQL、Redis、Qdrant 和 FastEmbed。"/><span className="image-expand"><ArrowUpRight size={15}/>查看完整架构图</span></a><p className="section-note">图中下半部分为本地完整版本。本公开站点仅提供静态展示与预置问答。</p></div>
      </div></section>

      <section className="portfolio-section container" id="ask">
        <SectionHeading number="03" label="EXPLORE THE DETAILS" title="从一个工程问题开始。" description="选一个你感兴趣的问题，了解作品集助手的实现。回答附有可查看的工程来源。"><Badge className="demo-badge"><span className="tiny-dot"/>交互演示</Badge></SectionHeading>
        <div className="demo-workspace"><aside className="question-panel" aria-label="预置问题"><div className="question-panel-heading"><span><MessageSquare size={16}/>你可以这样问</span><Badge>{demoAnswers.length}</Badge></div><div className="suggestions question-list">{demoAnswers.map((item, index) => <button key={item.id} className={messages.some(message => message.role === 'user' && message.text === item.question) ? 'is-asked' : ''} onClick={() => answer(item.question)}><span className="mono">{String(index + 1).padStart(2, '0')}</span><span>{item.question}</span><ArrowRight size={13} aria-hidden="true"/></button>)}</div><div className="question-panel-note"><BookOpen size={14}/><span>这些问答介绍本站助手的工程实现。</span></div></aside>
          <div className="chat"><div className="chat-head"><span className="chat-identity"><span className="bot-avatar"><Bot size={19}/></span><span><strong>明林项目助手</strong><small>公开工程资料 · 预置回答</small></span></span><button className="clear-chat" aria-label="清空对话" title="清空对话" disabled={messages.length === 0} onClick={() => { setMessages([]); setMatched(null) }}><Trash2 size={15}/><span>清空</span></button></div>
            <div className="chat-body" ref={conversation} role="log" aria-live="polite" aria-label="项目问答记录">{messages.length === 0 ? <div className="empty"><div className="empty-icon"><MessageSquare size={27} strokeWidth={1.4}/></div><h3>想了解哪一部分？</h3><p>选择一个问题，或输入关键词。<br/>从架构、检索到实现取舍，一起往下探索。</p><button className="empty-starter" onClick={() => answer('为什么使用混合检索？')}>为什么使用混合检索？<ArrowRight size={14}/></button></div> : messages.map((message, index) => <div className={`message-row ${message.role}`} key={index}><span className="message-avatar" aria-hidden="true">{message.role === 'user' ? '你' : <Bot size={16}/>}</span><div className={`bubble ${message.role}`}><small>{message.role === 'user' ? '你' : '项目助手 · 预置回答'}</small><div>{message.text}</div>{message.sources && <div className="message-sources">{message.sources.map(id => <button className="citation-link" key={id} onClick={() => openEvidence(id)}><BookOpen size={12}/>来源 · {evidence[id].title}<ArrowUpRight size={12}/></button>)}</div>}</div></div>)}</div>
            <div className="chat-composer"><div className="stream-events" aria-label="演示匹配状态"><span className="tiny-dot"/><span>{matched === null ? '选择问题即可开始' : matched ? '已匹配预置回答' : '暂无匹配内容'}</span><span className="composer-hint">静态演示 · 非实时 AI</span></div><form className="chat-form" onSubmit={submit}><label className="sr-only" htmlFor="demo-question">输入项目问题</label><textarea id="demo-question" value={question} maxLength={1200} onChange={event => setQuestion(event.target.value)} onKeyDown={event => { if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); answer(question) } }} placeholder="试试“混合检索”“SSE”或“隐私”…" rows={2}/><button type="submit" title="发送" aria-label="发送问题" disabled={!question.trim()}><Send size={17}/></button></form><div className="composer-footer"><span>Enter 发送 · Shift + Enter 换行</span><span>{question.length} / 1200</span></div></div>
          </div>
        </div><p className="demo-notice"><ShieldCheck size={14}/>通过关键词匹配 {demoAnswers.length} 个预置回答，不调用模型。输入仅保留在当前页面，刷新后清空。</p>
      </section>

      <section className="about-section container" id="contact"><div className="about-heading"><div className="eyebrow"><span>04</span>ABOUT & CONNECT</div><h2>保持好奇，<br/>把下一步做得更扎实。</h2></div><div className="about-copy"><p>我是明林，关注 AI 应用开发与 Agent 的工程落地。这个网站记录我在数据查询、业务工作流和检索问答中的实践与思考。</p><p>如果你也在探索相似的问题，欢迎到 GitHub 交流。</p><a className="button button-primary" href={profileUrl} target="_blank" rel="noreferrer"><Github size={17}/>在 GitHub 找到我<ArrowUpRight size={15}/></a></div></section>
    </main>
    <footer className="site-footer"><div className="container footer-inner"><a className="footer-brand" href="#top">明林<span> / ENGINEERING PORTFOLIO</span></a><span>© 2026 · 用实践记录成长</span><a className="back-to-top" href="#top">返回顶部<ArrowUp size={14}/></a></div></footer>
    <dialog className="evidence-dialog" ref={dialog} onClick={event => { if (event.target === dialog.current) dialog.current?.close() }} onClose={() => { setSelected(null); returnFocus.current?.focus() }} aria-labelledby="evidence-title">{selected && <><button className="dialog-close" onClick={() => dialog.current?.close()} aria-label="关闭证据详情"><X size={21}/></button><div className="eyebrow"><BookOpen size={14}/>ENGINEERING NOTE</div><h3 id="evidence-title">{evidence[selected].title}</h3><p>{evidence[selected].content}</p><div className="dialog-source"><FileCode2 size={16}/><small>{evidence[selected].location}</small></div><a className="button button-secondary" href={asset('evidence/project-notes.md')}>阅读完整公开说明<ArrowUpRight size={15}/></a></>}</dialog>
  </div>
}
