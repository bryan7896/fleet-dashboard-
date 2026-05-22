import { ReactNode } from 'react'
import { Header } from './Header'
import { Sidebar } from './Sidebar'
import { useAlertsGlobal } from '../../context/AlertContext'

interface LayoutProps {
  children: ReactNode
}

export const Layout = ({ children }: LayoutProps) => {
  const { alertCount } = useAlertsGlobal()

  return (
    <div className="min-h-screen bg-gray-900">
      <Header alertCount={alertCount} />
      <Sidebar />
      <main className="ml-64 pt-16 p-6">
        <div className="max-w-[1600px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}