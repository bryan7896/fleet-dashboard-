import { fetchAPI } from './api'
import type { AIRequest, AIResponse } from '../types'

export const aiService = {
  ask: async (question: string): Promise<string> => {
    try {
      const response = await fetchAPI<AIResponse>('/api/v1/ai/ask', {
        method: 'POST',
        body: { question } as AIRequest,
      })
      return response.answer
    } catch (error) {
      console.error('AI service error:', error)
      return 'Lo siento, no pude procesar tu pregunta. Intenta de nuevo más tarde.'
    }
  },
}