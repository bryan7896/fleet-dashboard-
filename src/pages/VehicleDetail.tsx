import { Layout } from '../components/layout/Layout'
import { useParams } from 'react-router-dom'

export const VehicleDetail = () => {
  const { id } = useParams<{ id: string }>()

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <button className="text-gray-400 hover:text-white">← Volver</button>
          <h1 className="text-2xl font-bold text-white">Vehículo: {id}</h1>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-white mb-4">Estado Actual</h2>
          <p className="text-gray-400">Cargando...</p>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-white mb-4">Métricas</h2>
          <p className="text-gray-400">Cargando...</p>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-white mb-4">Historial de Telemetría</h2>
          <p className="text-gray-400">Cargando...</p>
        </div>
      </div>
    </Layout>
  )
}