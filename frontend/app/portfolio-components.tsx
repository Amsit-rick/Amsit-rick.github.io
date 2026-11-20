"use client"

import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { ArrowDown, ArrowRight, ArrowUpRight, Check, Code2, Database, Github, Headset, Menu, X } from 'lucide-react'
import { featuredProjects } from './featured-projects'

export const profileUrl = 'https://github.com/Amsit-rick'

export function Badge({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <span className={`badge ${className}`}>{children}</span>
}

export function SectionHeading({ number, label, title, description, children }: {
  number: string; label: string; title: string; description: string; children?: ReactNode
}) {
  return <div className="section-heading"><div className="section-heading-copy"><div className="eyebrow"><span>{number}</span>{label}</div><h2>{title}</h2><p>{description}</p></div>{children}</div>
}

const navigation = [{ id: 'projects', label: '精选项目' }, { id: 'evidence', label: '工程笔记' }, { id: 'ask', label: '交互演示' }, { id: 'contact', label: '关于我' }]

export function Navigation() {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState('')
  const toggle = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    let frame = 0
    const update = () => {
      let current = ''
      for (const item of navigation) {
        const element = document.getElementById(item.id)
        if (element && element.getBoundingClientRect().top <= window.innerHeight * .3) current = item.id
      }
      if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 5) current = 'contact'
      setActive(current)
      frame = 0
    }
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update) }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); cancelAnimationFrame(frame) }
  }, [])
  useEffect(() => {
    if (!open) return
    const close = (event: KeyboardEvent) => { if (event.key === 'Escape') { setOpen(false); toggle.current?.focus() } }
    const media = window.matchMedia('(min-width: 761px)')
    const resize = () => { if (media.matches) setOpen(false) }
    document.addEventListener('keydown', close)
    media.addEventListener('change', resize)
    return () => { document.removeEventListener('keydown', close); media.removeEventListener('change', resize) }
  }, [open])
  return <header className="site-header"><nav className="site-nav container" aria-label="主导航">
    <a className="site-brand" href="#top" aria-label="明林作品集首页" onClick={() => setOpen(false)}><span className="brand-symbol">m<span>.</span></span><span>明林<span className="brand-caption">AI APPLICATION ENGINEER</span></span></a>
    <div className={`desktop-nav ${open ? 'is-open' : ''}`} id="site-navigation">{navigation.map(item => <a key={item.id} href={`#${item.id}`} aria-current={active === item.id ? 'location' : undefined} onClick={() => setOpen(false)}>{item.label}</a>)}</div>
    <div className="nav-actions"><a className="nav-github" href={profileUrl} target="_blank" rel="noreferrer" aria-label="在新窗口访问 GitHub 主页"><Github size={18}/><span>GitHub</span><ArrowUpRight size={13}/></a><button className="menu-toggle" ref={toggle} aria-expanded={open} aria-controls="site-navigation" aria-label={open ? '收起导航' : '展开导航'} onClick={() => setOpen(!open)}>{open ? <X size={21}/> : <Menu size={21}/>}</button></div>
  </nav></header>
}

export function WorkbenchPreview() {
  return <div className="workbench" aria-label="精选项目与工程流程概览">
    <div className="workbench-toolbar"><span><Code2 size={15}/> engineering / selected-work</span><span className="window-dots" aria-hidden="true"><i/><i/><i/></span></div>
    <div className="workbench-body"><div className="workbench-title"><span className="mono">FROM IDEA TO IMPLEMENTATION</span><span className="tiny-dot"/>工程实践</div>
      {featuredProjects.map((project, index) => <a className={`workbench-project workbench-project-${index + 1}`} key={project.id} href={`#${project.id}`}><span className="workbench-icon">{index === 0 ? <Database size={22}/> : <Headset size={22}/>}</span><span><small>{index === 0 ? 'DATA INTELLIGENCE' : 'SERVICE AUTOMATION'}</small><strong>{index === 0 ? project.title : '售后工单 Copilot'}</strong><span className="workbench-project-caption">{index === 0 ? '自然语言 → SQL → 可追溯结果' : '业务事实 → 处理建议 → 人工审核'}</span></span><ArrowUpRight size={17}/></a>)}
      <div className="workbench-principle"><span className="mono">DESIGN PRINCIPLE</span><p>让模型辅助判断，<br/><strong>让规则守住执行边界。</strong></p><div><span>检索证据</span><ArrowRight size={13}/><span>工具编排</span><ArrowRight size={13}/><span>人工审核</span></div></div>
    </div><div className="workbench-footer"><span><span className="tiny-dot"/>源码与工程说明可查看</span><a href="#projects" aria-label="向下查看精选项目"><ArrowDown size={17}/></a></div>
  </div>
}

export function ProjectCard({ project, index }: { project: typeof featuredProjects[number]; index: number }) {
  const stages = index === 0 ? ['自然语言问题', 'Schema 召回', 'SQL 安全校验', '只读查询结果'] : ['售后工单', '事实与政策检索', '风险分级', '人工审核']
  return <article className={`project project-card project-card-${index + 1}`} id={project.id} aria-labelledby={`${project.id}-title`}>
    <div className="project-visual" aria-label={`${project.title}流程示意`}><div className="project-visual-top"><Badge>项目 {String(index + 1).padStart(2, '0')}</Badge><span className="mono">WORKFLOW / 流程示意</span></div><div className="project-flow-diagram"><div className="flow-symbol">{index === 0 ? <Database size={30} strokeWidth={1.4}/> : <Headset size={30} strokeWidth={1.4}/>}</div><div className="flow-stages">{stages.map((stage, stageIndex) => <div className="flow-stage" key={stage}><span>{String(stageIndex + 1).padStart(2, '0')}</span>{stage}{stageIndex < stages.length - 1 && <ArrowDown size={12} aria-hidden="true"/>}</div>)}</div></div><div className="project-visual-bottom"><span>{index === 0 ? 'NL2SQL / CONTROLLED EXECUTION' : 'MULTI-AGENT / HUMAN IN THE LOOP'}</span><span aria-hidden="true">↗</span></div></div>
    <header className="project-card-header"><span className="project-category">{project.label.split(' · ')[1]}</span><h3 id={`${project.id}-title`}>{project.title}</h3><p className="project-subtitle">{project.subtitle}</p></header>
    <div className="project-card-content"><p className="project-description">{project.description}</p><ul className="project-highlights">{project.highlights.map(item => <li key={item}><Check size={15} aria-hidden="true"/>{item}</li>)}</ul><div className="project-stack" aria-label="技术栈">{project.stack.split(' · ').map(item => <Badge key={item}>{item}</Badge>)}</div><details className="project-details"><summary>流程与工程取舍 <span className="details-plus" aria-hidden="true">+</span></summary><p className="project-flow">{project.flow}</p><p>{project.engineering}</p><small>说明依据：{project.source}</small></details></div>
    <footer className="project-card-footer"><a className="button button-project" href={project.repository} target="_blank" rel="noreferrer"><Github size={16}/>查看 GitHub 源码<ArrowUpRight size={15}/></a><span>公开源码</span></footer>
  </article>
}
