import { Layout } from '../components/layout/Layout'
import { AIChat } from '../components/ai/AIChat'
import { useAlertsGlobal } from '../context/AlertContext'

export const AIAssistant = () => {
  const { alertCount } = useAlertsGlobal()
  return (
    <Layout alertCount={alertCount}>
      <div className="max-w-4xl mx-auto">
        <AIChat />
      </div>
    </Layout>
  )
}