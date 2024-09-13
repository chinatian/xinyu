import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '响应结果 - 汉语新解',
  description: '查看您的汉语新解响应',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}