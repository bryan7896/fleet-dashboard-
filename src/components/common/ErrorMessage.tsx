interface ErrorMessageProps {
  message: string
  onRetry?: () => void
}

export const ErrorMessage = ({ message, onRetry }: ErrorMessageProps) => {
  return (
    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
      <div className="flex items-center gap-3">
        <span className="text-2xl">⚠️</span>
        <div className="flex-1">
          <p className="text-red-400">{message}</p>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm transition-colors"
          >
            Reintentar
          </button>
        )}
      </div>
    </div>
  )
}