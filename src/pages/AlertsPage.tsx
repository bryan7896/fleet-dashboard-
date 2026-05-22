import { useNavigate } from 'react-router-dom'
import { Layout } from '../components/layout/Layout'
import { LoadingSpinner } from '../components/common/LoadingSpinner'
import { useAlertsGlobal } from '../context/AlertContext'

export const AlertsPage = () => {
  const navigate = useNavigate()
  const { alerts, loading, error, fetchAlerts } = useAlertsGlobal()

  const getSeverityBadge = (severity: string) => {
    const config: Record<string, string> = {
      High: 'bg-red-500/20 text-red-400',
      Medium: 'bg-yellow-500/20 text-yellow-400',
      Low: 'bg-blue-500/20 text-blue-400',
      Critical: 'bg-purple-500/20 text-purple-400',
    }
    return config[severity] || 'bg-gray-500/20 text-gray-400'
  }

  const getTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      HIGH_SPEED: '🚗💨',
      LOW_BATTERY: '🔋',
      MAINTENANCE: '🔧',
      COLLISION: '💥',
    }
    return icons[type] || '⚠️'
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-white">Alertas de la Flota</h1>
          <button
            onClick={() => fetchAlerts()}
            disabled={loading}
            className="btn-secondary text-sm flex items-center gap-2"
          >
            {loading ? <LoadingSpinner size="sm" /> : '🔄'}
            Refrescar
          </button>
        </div>

        {/* Active Alerts Card */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Alertas Activas</h2>
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
              {alerts.length} activa{alerts.length !== 1 ? 's' : ''}
            </span>
          </div>

          {loading && !alerts.length ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner message="Cargando alertas..." />
            </div>
          ) : error ? (
            <div className="bg-red-500/10 border border-red-500 rounded-lg p-4 text-center">
              <p className="text-red-400">{error}</p>
              <button onClick={fetchAlerts} className="mt-2 text-sm text-red-400 underline">
                Reintentar
              </button>
            </div>
          ) : alerts.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-5xl mb-3">✅</div>
              <p className="text-gray-400">No hay alertas activas</p>
              <p className="text-gray-500 text-sm mt-1">Todo está en orden</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="text-gray-400 border-b border-gray-700">
                  <tr>
                    <th className="pb-3">Tipo</th>
                    <th className="pb-3">Severidad</th>
                    <th className="pb-3">Vehículo</th>
                    <th className="pb-3">Mensaje</th>
                    <th className="pb-3">Fecha/Hora</th>
                  </tr>
                </thead>
                <tbody>
                  {alerts.map((alert) => (
                    <tr
                      key={alert.alertId}
                      onClick={() => navigate(`/vehicle/${alert.vehicleId}`)}
                      className="border-b border-gray-700/50 hover:bg-gray-700/30 cursor-pointer transition-colors"
                    >
                      <td className="py-3">
                        <span className="flex items-center gap-2">
                          <span className="text-lg">{getTypeIcon(alert.type)}</span>
                          <span className="text-gray-200">{alert.type.replace('_', ' ')}</span>
                        </span>
                      </td>
                      <td className="py-3">
                        <span className={`px-2 py-1 rounded-full text-xs ${getSeverityBadge(alert.severity)}`}>
                          {alert.severity}
                        </span>
                      </td>
                      <td className="py-3 text-gray-300 font-mono text-sm">
                        {alert.plate}
                      </td>
                      <td className="py-3 text-gray-300">{alert.message}</td>
                      <td className="py-3 text-gray-400 text-sm">
                        {new Date(alert.createdAtUtc).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Optional History Section (placeholder) */}
        <div className="card">
          <h2 className="text-lg font-semibold text-white mb-4">Historial de Alertas</h2>
          <p className="text-gray-400 text-center py-4">
            Funcionalidad en desarrollo. Las alertas resueltas se mostrarán aquí próximamente.
          </p>
        </div>
      </div>
    </Layout>
  )
}