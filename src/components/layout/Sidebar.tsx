import { NavLink } from 'react-router-dom'

const navigation = [
  { name: 'Dashboard', path: '/', icon: '📊' },
  { name: 'Alerts', path: '/alerts', icon: '⚠️' },
  { name: 'AI Assistant', path: '/ai-assistant', icon: '🤖' },
]

export const Sidebar = () => {
  return (
    <aside className="fixed left-0 top-16 bottom-0 w-64 bg-gray-800 border-r border-gray-700 z-20">
      <nav className="mt-6">
        <div className="px-3 space-y-1">
          {navigation.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`
              }
            >
              <span className="text-xl">{item.icon}</span>
              {item.name}
            </NavLink>
          ))}
        </div>
      </nav>
    </aside>
  )
}