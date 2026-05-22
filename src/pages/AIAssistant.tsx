import { Layout } from '../components/layout/Layout'
import { AIChat } from '../components/ai/AIChat'

export const AIAssistant = () => {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <AIChat />
      </div>
    </Layout>
  )
}