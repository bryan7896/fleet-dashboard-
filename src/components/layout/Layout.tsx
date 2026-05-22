import type { ReactNode } from 'react'
import { Header } from './Header'
import { Sidebar } from './Sidebar'

interface LayoutProps {
  children: ReactNode
  alertCount?: number
}

export const Layout = ({ children, alertCount = 0 }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-gray-900">
      <Header alertCount={alertCount} />
      <Sidebar />
      <main className="ml-64 pt-20 p-6 ">
        <div className="max-w-[1600px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}