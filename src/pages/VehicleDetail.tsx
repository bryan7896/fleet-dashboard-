import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Layout } from '../components/layout/Layout'
import { vehiclesService } from '../services/vehicles'
import type { VehicleState, VehicleMetrics, TelemetryHistory } from '../types'
import { LoadingSpinner } from '../components/common/LoadingSpinner'
import { useToast } from '../components/common/Toast'

export const VehicleDetail = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { showToast } = useToast()

  const [state, setState] = useState<VehicleState | null>(null)
  const [metrics, setMetrics] = useState<VehicleMetrics | null>(null)
  const [history, setHistory] = useState<TelemetryHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return

    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        const [vehicleState, vehicleMetrics, telemetryHistory] = await Promise.all([
          vehiclesService.getState(id),
          vehiclesService.getMetrics(id),
          vehiclesService.getTelemetryHistory(id),
        ])
        setState(vehicleState)
        setMetrics(vehicleMetrics)
        setHistory(telemetryHistory)
      } catch (err) {
        console.error('Error fetching vehicle details:', err)
        setError('No se pudieron cargar los datos del vehículo')
        showToast('Error al cargar detalles del vehículo', 'error')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id])

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString()
  }

  const getStatusBadge = (status: string) => {
    const config: Record<string, string> = {
      Moving: 'bg-green-500/20 text-green-400',
      Stopped: 'bg-gray-500/20 text-gray-400',
      Idle: 'bg-yellow-500/20 text-yellow-400',
      Offline: 'bg-red-500/20 text-red-400',
    }
    return config[status] || 'bg-gray-500/20 text-gray-400'
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner message="Cargando datos del vehículo..." />
        </div>
      </Layout>
    )
  }

  if (error) {
    return (
      <Layout>
        <div className="bg-red-500/10 border border-red-500 rounded-lg p-4">
          <p className="text-red-400">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="mt-3 btn-primary text-sm"
          >
            Volver al Dashboard
          </button>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header con botón volver */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="text-gray-400 hover:text-white transition-colors text-2xl"
          >
            ←
          </button>
          <h1 className="text-2xl font-bold text-white">
            Vehículo: {state?.plate?.slice(0, 8) || id?.slice(0, 8)}
          </h1>
        </div>

        {/* Estado Actual */}
        <div className="card">
          <h2 className="text-lg font-semibold text-white mb-4">Estado Actual</h2>
          {state ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-gray-400 text-sm">Estado</p>
                <p className="text-white font-medium">
                  <span className={`inline-block px-2 py-1 rounded-full text-xs ${getStatusBadge(state.status)}`}>
                    {state.status}
                  </span>
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Velocidad</p>
                <p className="text-white font-medium">{state.lastSpeedKph} km/h</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Última ubicación</p>
                <p className="text-white font-medium">
                  {state.lastLatitude?.toFixed(4)}, {state.lastLongitude?.toFixed(4)}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Última actualización</p>
                <p className="text-white font-medium">{formatDate(state.lastTelemetryAtUtc)}</p>
              </div>
            </div>
          ) : (
            <p className="text-gray-400">No hay datos de estado disponibles</p>
          )}
        </div>

        {/* Métricas */}
        <div className="card">
          <h2 className="text-lg font-semibold text-white mb-4">Métricas</h2>
          {metrics ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-gray-400 text-sm">Total Eventos</p>
                <p className="text-white font-medium">{metrics.totalTelemetryEvents}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Velocidad Promedio</p>
                <p className="text-white font-medium">{metrics.averageSpeedKph} km/h</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Velocidad Máxima</p>
                <p className="text-white font-medium">{metrics.maxSpeedKph} km/h</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Último evento</p>
                <p className="text-white font-medium">{formatDate(metrics.lastTelemetryAtUtc)}</p>
              </div>
            </div>
          ) : (
            <p className="text-gray-400">No hay métricas disponibles</p>
          )}
        </div>

        {/* Historial de Telemetría */}
        <div className="card">
          <h2 className="text-lg font-semibold text-white mb-4">Historial de Telemetría</h2>
          {history.length === 0 ? (
            <p className="text-gray-400">No hay historial de telemetría</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="text-gray-400 border-b border-gray-700">
                  <tr>
                    <th className="pb-2">Fecha/Hora</th>
                    <th className="pb-2">Latitud</th>
                    <th className="pb-2">Longitud</th>
                    <th className="pb-2">Velocidad</th>
                    <th className="pb-2">Encendido</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((item, idx) => (
                    <tr key={idx} className="border-b border-gray-700/50">
                      <td className="py-2 text-gray-300">{formatDate(item.capturedAtUtc)}</td>
                      <td className="py-2 text-gray-300">{item.latitude.toFixed(5)}</td>
                      <td className="py-2 text-gray-300">{item.longitude.toFixed(5)}</td>
                      <td className="py-2 text-gray-300">{item.speedKph} km/h</td>
                      <td className="py-2">
                        {item.ignitionOn ? (
                          <span className="text-green-400">✅ Encendido</span>
                        ) : (
                          <span className="text-gray-400">⛔ Apagado</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}