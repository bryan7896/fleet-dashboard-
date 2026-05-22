interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  message?: string
}

export const LoadingSpinner = ({ size = 'md', message }: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  }

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className={`${sizeClasses[size]} border-4 border-gray-600 border-t-primary-500 rounded-full animate-spin`} />
      {message && <p className="text-gray-400 text-sm">{message}</p>}
    </div>
  )
}