// src/pages/NotFound.tsx
import { Layout } from '../components/layout/Layout'
import { Link } from 'react-router-dom'

export const NotFound = () => {
  return (
    <Layout>
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <h1 className="text-6xl font-bold text-gray-600">404</h1>
        <p className="text-xl text-gray-400 mt-2">Página no encontrada</p>
        <Link to="/" className="btn-primary mt-6">Volver al Dashboard</Link>
      </div>
    </Layout>
  )
}