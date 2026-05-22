import type { Alert } from '../../types'

interface AlertsPanelProps {
  alerts: Alert[]
  loading?: boolean
}

export const AlertsPanel = ({ alerts, loading = false }: AlertsPanelProps) => {
  const getSeverityStyles = (severity: string) => {
    const styles: Record<string, { bg: string; border: string; text: string }> = {
      High: { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400' },
      Medium: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', text: 'text-yellow-400' },
      Low: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400' },
      Critical: { bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-400' },
    }
    return styles[severity] || styles.Low
  }

  if (loading) {
    return (
      <div className="card">
        <h2 className="text-lg font-semibold text-white mb-4">Alertas en Tiempo Real</h2>
        <div className="flex justify-center py-8">
          <div className="animate-pulse text-gray-400">Cargando alertas...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">Alertas en Tiempo Real</h2>
        {alerts.length > 0 && (
          <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
            {alerts.length} activas
          </span>
        )}
      </div>
      {alerts.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-4xl mb-2">✅</div>
          <p className="text-gray-400">No hay alertas activas</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {alerts.map((alert) => {
            const styles = getSeverityStyles(alert.severity)
            return (
              <div
                key={alert.alertId}
                className={`${styles.bg} border ${styles.border} rounded-lg p-3`}
              >
                <div className="flex items-center justify-between">
                  <span className={`font-medium ${styles.text}`}>
                    {alert.type.replace('_', ' ')}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full ${styles.bg} ${styles.text}`}>
                    {alert.severity}
                  </span>
                </div>
                <p className="text-sm text-gray-300 mt-1">{alert.message}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Vehículo: {alert.vehicleId.slice(0, 8)}... |{' '}
                  {new Date(alert.createdAtUtc).toLocaleString()}
                </p>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}