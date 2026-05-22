import { useEffect, useState } from 'react'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

interface ToastProps {
  id: string
  message: string
  type: ToastType
  duration?: number
  onClose: (id: string) => void
}

const icons = {
  success: '✅',
  error: '❌',
  warning: '⚠️',
  info: 'ℹ️',
}

const bgColors = {
  success: 'bg-green-600',
  error: 'bg-red-600',
  warning: 'bg-yellow-600',
  info: 'bg-blue-600',
}

export const Toast = ({ id, message, type, duration = 5000, onClose }: ToastProps) => {
  useEffect(() => {
    const timer = setTimeout(() => onClose(id), duration)
    return () => clearTimeout(timer)
  }, [id, duration, onClose])

  return (
    <div className={`${bgColors[type]} rounded-lg shadow-lg p-3 mb-2 min-w-[280px] animate-slide-in`}>
      <div className="flex items-center gap-2">
        <span className="text-xl">{icons[type]}</span>
        <span className="text-white text-sm flex-1">{message}</span>
        <button onClick={() => onClose(id)} className="text-white/70 hover:text-white">
          ✕
        </button>
      </div>
    </div>
  )
}

export const ToastContainer = () => {
  const [toasts, setToasts] = useState<Array<{ id: string; message: string; type: ToastType }>>([])

  const addToast = (message: string, type: ToastType = 'info') => {
    const id = Date.now().toString()
    setToasts(prev => [...prev, { id, message, type }])
  }

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }

  return (
    <div className="fixed bottom-6 left-6 z-50 flex flex-col-reverse">
      {toasts.map(toast => (
        <Toast key={toast.id} id={toast.id} message={toast.message} type={toast.type} onClose={removeToast} />
      ))}
    </div>
  )
}

// Hook para usar toasts en cualquier componente
let globalAddToast: ((message: string, type: ToastType) => void) | null = null

export const useToast = () => {
  return {
    showToast: (message: string, type: ToastType = 'info') => {
      if (globalAddToast) globalAddToast(message, type)
      else console.warn('ToastContainer not mounted')
    },
  }
}

// Para usar en componentes que no son React (servicios)
export const registerToastContainer = (addFn: (message: string, type: ToastType) => void) => {
  globalAddToast = addFn
}