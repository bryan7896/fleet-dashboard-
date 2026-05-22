interface StatsCardsProps {
  totalVehicles: number
  activeAlerts: number
  averageSpeed: number
  activeVehicles: number
  loading?: boolean
}

export const StatsCards = ({
  totalVehicles,
  activeAlerts,
  averageSpeed,
  activeVehicles,
  loading = false,
}: StatsCardsProps) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="card animate-pulse">
            <div className="h-4 bg-gray-700 rounded w-24 mb-2" />
            <div className="h-8 bg-gray-700 rounded w-16" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="card">
        <h3 className="text-gray-400 text-sm">Total Vehículos</h3>
        <p className="text-3xl font-bold text-white mt-2">{totalVehicles}</p>
      </div>
      <div className="card">
        <h3 className="text-gray-400 text-sm">Alertas Activas</h3>
        <p className="text-3xl font-bold text-red-500 mt-2">{activeAlerts}</p>
      </div>
      <div className="card">
        <h3 className="text-gray-400 text-sm">Velocidad Promedio</h3>
        <p className="text-3xl font-bold text-white mt-2">{averageSpeed} km/h</p>
      </div>
      <div className="card">
        <h3 className="text-gray-400 text-sm">Vehículos Activos</h3>
        <p className="text-3xl font-bold text-green-500 mt-2">{activeVehicles}</p>
      </div>
    </div>
  )
}