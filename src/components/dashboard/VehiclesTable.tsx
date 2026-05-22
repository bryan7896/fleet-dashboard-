import { useNavigate } from 'react-router-dom'
import type { Vehicle, VehicleState } from '../../types'

interface VehiclesTableProps {
  vehicles: Vehicle[]
  vehicleStates: Map<string, VehicleState>
  loading?: boolean
  error?: string | null
}

export const VehiclesTable = ({
  vehicles,
  vehicleStates,
  loading = false,
  error = null,
}: VehiclesTableProps) => {
  const navigate = useNavigate()

  if (loading) {
    return (
      <div className="card">
        <h2 className="text-lg font-semibold text-white mb-4">Vehículos</h2>
        <div className="flex justify-center py-8">
          <div className="animate-pulse text-gray-400">Cargando vehículos...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="card">
        <h2 className="text-lg font-semibold text-white mb-4">Vehículos</h2>
        <div className="bg-red-500/10 border border-red-500 rounded-lg p-3">
          <p className="text-red-500 text-sm">{error}</p>
        </div>
      </div>
    )
  }

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; label: string }> = {
      Moving: { color: 'bg-green-500/20 text-green-400', label: 'En movimiento' },
      Stopped: { color: 'bg-gray-500/20 text-gray-400', label: 'Detenido' },
      Idle: { color: 'bg-yellow-500/20 text-yellow-400', label: 'Inactivo' },
      Offline: { color: 'bg-red-500/20 text-red-400', label: 'Offline' },
    }
    const config = statusConfig[status] || statusConfig.Stopped
    return <span className={`px-2 py-1 rounded-full text-xs ${config.color}`}>{config.label}</span>
  }

  return (
    <div className="card">
      <h2 className="text-lg font-semibold text-white mb-4">Vehículos</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="text-gray-400 border-b border-gray-700">
            <tr>
              <th className="pb-2">Placa</th>
              <th className="pb-2">Alias</th>
              <th className="pb-2">Estado</th>
              <th className="pb-2">Velocidad</th>
              <th className="pb-2">Última Actualización</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-gray-500">
                  No hay vehículos. Usa el simulador para crear uno.
                </td>
              </tr>
            ) : (
              vehicles.map((vehicle) => {
                const state = vehicleStates.get(vehicle.id)
                return (
                  <tr
                    key={vehicle.id}
                    onClick={() => navigate(`/vehicle/${vehicle.id}`)}
                    className="border-b border-gray-700/50 hover:bg-gray-700/30 cursor-pointer transition-colors"
                  >
                    <td className="py-2 font-medium">{vehicle.plate}</td>
                    <td className="py-2 text-gray-300">{vehicle.alias}</td>
                    <td className="py-2">
                      {state ? getStatusBadge(state.status) : (
                        <span className="px-2 py-1 rounded-full text-xs bg-gray-500/20 text-gray-400">
                          Sin datos
                        </span>
                      )}
                    </td>
                    <td className="py-2">
                      {state ? `${state.lastSpeedKph} km/h` : '--'}
                    </td>
                    <td className="py-2 text-gray-400 text-sm">
                      {state ? new Date(state.lastTelemetryAtUtc).toLocaleTimeString() : '--'}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}