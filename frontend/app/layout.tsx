import './globals.css'

export const metadata = {
  title: '明林项目面试助手',
  description: '可验证的工程项目作品集与 AI 追问入口',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="zh-CN"><body>{children}</body></html>
}
