import { useState, useRef, useEffect } from 'react'
import { aiService } from '../../services/ai'
import { LoadingSpinner } from '../common/LoadingSpinner'

interface Message {
  id: string
  text: string
  isUser: boolean
  timestamp: Date
}

const suggestedQuestions = [
  '¿Hay vehículos con exceso de velocidad?',
  'Resumen general de la flota',
  '¿Qué vehículos están detenidos?',
  '¿Cuál es la velocidad promedio de la flota?',
  '¿Cuántas alertas activas hay?',
]

export const AIChat = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      text: '👋 Hola, soy el asistente de flota. Puedes preguntarme sobre el estado de los vehículos, alertas, velocidades, etc.',
      isUser: false,
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = async (question: string) => {
    if (!question.trim() || isLoading) return

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: question,
      isUser: true,
      timestamp: new Date(),
    }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    // Get AI response
    const answer = await aiService.ask(question)

    // Add AI response
    const aiMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: answer,
      isUser: false,
      timestamp: new Date(),
    }
    setMessages(prev => [...prev, aiMessage])
    setIsLoading(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  const handleSuggestionClick = (question: string) => {
    sendMessage(question)
  }

  return (
    <div className="card flex flex-col h-[calc(100vh-12rem)]">
      <h2 className="text-lg font-semibold text-white mb-4">Asistente de Flota (IA)</h2>

      {/* Messages container */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-3 pr-2">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-2 ${
                msg.isUser
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-700 text-gray-200'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
              <p className="text-xs opacity-70 mt-1">
                {msg.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-700 rounded-lg px-4 py-2">
              <LoadingSpinner size="sm" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested questions */}
      <div className="mb-3 flex flex-wrap gap-2">
        {suggestedQuestions.map((q) => (
          <button
            key={q}
            onClick={() => handleSuggestionClick(q)}
            disabled={isLoading}
            className="text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 px-3 py-1 rounded-full transition-colors"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input form */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Escribe tu pregunta aquí..."
          disabled={isLoading}
          className="input flex-1"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="btn-primary"
        >
          Enviar
        </button>
      </form>
    </div>
  )
}