import './globals.css'

export const metadata = {
  title: 'rick agent · AI 应用与 Agent 工程作品集',
  description: 'rick agent的工程作品集：Query Pilot 数据查询 Agent、售后工单 Copilot，以及公开工程笔记和交互问答演示。',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="zh-CN"><body>{children}</body></html>
}
