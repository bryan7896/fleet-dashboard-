import { Layout } from '../components/layout/Layout'

export const Dashboard = () => {
  return (
    <Layout alertCount={3}>
      <div className="space-y-6">
        {/* Stats Cards Placeholder */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="card">
            <h3 className="text-gray-400 text-sm">Total Vehículos</h3>
            <p className="text-3xl font-bold text-white mt-2">0</p>
          </div>
          <div className="card">
            <h3 className="text-gray-400 text-sm">Alertas Activas</h3>
            <p className="text-3xl font-bold text-red-500 mt-2">0</p>
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
            <p className="text-gray-400">Mapa se cargará aquí (Fase 3)</p>
          </div>
        </div>

        {/* Vehicles Table Placeholder */}
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
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-500">
                    No hay vehículos. Usa el simulador para crear uno.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Alerts Panel Placeholder */}
        <div className="card">
          <h2 className="text-lg font-semibold text-white mb-4">Alertas en Tiempo Real</h2>
          <div className="space-y-2">
            <p className="text-gray-400 text-center py-4">No hay alertas activas</p>
          </div>
        </div>
      </div>
    </Layout>
  )
}