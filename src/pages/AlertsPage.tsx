import { Layout } from '../components/layout/Layout'

export const AlertsPage = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-white">Alertas</h1>
        
        <div className="card">
          <h2 className="text-lg font-semibold text-white mb-4">Alertas Activas</h2>
          <div className="space-y-2">
            <p className="text-gray-400 text-center py-4">No hay alertas activas</p>
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-white mb-4">Historial de Alertas</h2>
          <p className="text-gray-400 text-center py-4">No hay historial disponible</p>
        </div>
      </div>
    </Layout>
  )
}