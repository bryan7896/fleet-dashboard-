import { APP_NAME } from '../../utils/constants'

interface HeaderProps {
  alertCount?: number
}

export const Header = ({ alertCount = 0 }: HeaderProps) => {
  return (
    <header className="bg-gray-800 border-b border-gray-700 fixed top-0 left-0 right-0 z-30">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">F</span>
          </div>
          <h1 className="text-xl font-semibold text-white">{APP_NAME}</h1>
        </div>
        
        <div className="flex items-center gap-4 pr-6">
          {/* Alert Badge */}
          <div className="relative">
            <button className="text-gray-300 hover:text-white transition-colors">
              🔔
            </button>
            {alertCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {alertCount}
              </span>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}