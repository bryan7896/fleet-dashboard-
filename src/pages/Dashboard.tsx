import { useEffect, useState } from 'react'
import { Layout } from '../components/layout/Layout'
import { useVehicles } from '../hooks/useVehicles'
import { useAlerts } from '../hooks/useAlerts'
import { useSignalR } from '../hooks/useSignalR'
import { healthService } from '../services/health'
import type { HealthCheck } from '../types'

export const Dashboard = () => {
  const { vehicles, loading: vehiclesLoading, error: vehiclesError } = useVehicles()
  const { alerts, alertCount, addAlertFromEvent } = useAlerts()
  const [backendStatus, setBackendStatus] = useState<HealthCheck | null>(null)
  const [backendError, setBackendError] = useState<string | null>(null)

  // Check backend health on mount
  useEffect(() => {
    healthService.check()
      .then(setBackendStatus)
      .catch(err => {
        console.error('Backend health check failed:', err)
        setBackendError('Backend no disponible')
      })
  }, [])

  // SignalR connection
  const { isConnected: signalRConnected } = useSignalR({
    onAlertCreated: (data) => {
      console.log('Alert received in Dashboard:', data)
      addAlertFromEvent(data)
    },
    onTelemetryReceived: (data) => {
      console.log('Telemetry received:', data)
    },
  })

  return (
    <Layout alertCount={alertCount}>
      <div className="space-y-6">
        {/* Backend Status Indicator */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${backendStatus ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-sm text-gray-400">
              Backend: {backendStatus ? 'Conectado' : backendError || 'Verificando...'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${signalRConnected ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'}`} />
            <span className="text-sm text-gray-400">
              Realtime: {signalRConnected ? 'Conectado' : 'Conectando...'}
            </span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="card">
            <h3 className="text-gray-400 text-sm">Total Vehículos</h3>
            <p className="text-3xl font-bold text-white mt-2">
              {vehiclesLoading ? '...' : vehicles.length}
            </p>
          </div>
          <div className="card">
            <h3 className="text-gray-400 text-sm">Alertas Activas</h3>
            <p className="text-3xl font-bold text-red-500 mt-2">
              {alertCount}
            </p>
          </div>
          <div className="card">
            <h3 className="text-gray-400 text-sm">Velocidad Promedio</h3>
            <p className="text-3xl font-bold text-white mt-2">0 km/h</p>
          </div>
          <div className="card">
            <h3 className="text-gray-400 text-sm">Vehículos Activos</h3>
            <p className="text-3xl font-bold text-green-500 mt-2">0</p>
          </div>
        </div>

        {/* Map Placeholder */}
        <div className="card">
          <h2 className="text-lg font-semibold text-white mb-4">Mapa de Flota</h2>
          <div className="bg-gray-700 rounded-lg h-[400px] flex items-center justify-center">
            <p className="text-gray-400">
              {backendStatus ? 'Mapa se cargará aquí (Fase 3)' : 'Esperando conexión con el backend...'}
            </p>
          </div>
        </div>

        {/* Vehicles Table */}
        <div className="card">
          <h2 className="text-lg font-semibold text-white mb-4">Vehículos</h2>
          {vehiclesError && (
            <div className="bg-red-500/10 border border-red-500 rounded-lg p-3 mb-4">
              <p className="text-red-500 text-sm">{vehiclesError}</p>
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="text-gray-400 border-b border-gray-700">
                <tr>
                  <th className="pb-2">Placa</th>
                  <th className="pb-2">Alias</th>
                  <th className="pb-2">Estado</th>
                  <th className="pb-2">ID</th>
                </tr>
              </thead>
              <tbody>
                {vehiclesLoading ? (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-gray-500">
                      Cargando vehículos...
                    </td>
                  </tr>
                ) : vehicles.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-gray-500">
                      No hay vehículos. Usa POST /vehicles para crear uno.
                    </td>
                  </tr>
                ) : (
                  vehicles.map((vehicle) => (
                    <tr key={vehicle.id} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                      <td className="py-2 font-medium">{vehicle.plate}</td>
                      <td className="py-2 text-gray-300">{vehicle.alias}</td>
                      <td className="py-2">
                        <span className={`px-2 py-1 rounded-full text-xs ${vehicle.isActive ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                          {vehicle.isActive ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="py-2 text-gray-400 text-sm">{vehicle.id.slice(0, 8)}...</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Alerts Panel */}
        <div className="card">
          <h2 className="text-lg font-semibold text-white mb-4">Alertas en Tiempo Real</h2>
          {alerts.length === 0 ? (
            <p className="text-gray-400 text-center py-4">No hay alertas activas</p>
          ) : (
            <div className="space-y-2">
              {alerts.slice(0, 5).map((alert) => (
                <div key={alert.alertId} className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-red-400">{alert.type}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      alert.severity === 'High' ? 'bg-red-500/20 text-red-400' :
                      alert.severity === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-blue-500/20 text-blue-400'
                    }`}>
                      {alert.severity}
                    </span>
                  </div>
                  <p className="text-sm text-gray-300 mt-1">{alert.message}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Vehículo: {alert.vehicleId.slice(0, 8)}... | {new Date(alert.createdAtUtc).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}