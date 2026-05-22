import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Layout } from '../components/layout/Layout'
import { StatsCards } from '../components/dashboard/StatsCards'
import { VehiclesTable } from '../components/dashboard/VehiclesTable'
import { AlertsPanel } from '../components/dashboard/AlertsPanel'
import { FleetMap } from '../components/dashboard/FleetMap'
import { useVehicles } from '../hooks/useVehicles'
import { useAlerts } from '../hooks/useAlerts'
import { useSignalR } from '../hooks/useSignalR'
import { useVehicleRealtime } from '../hooks/useVehicleRealtime'
import { healthService } from '../services/health'
import type { HealthCheck } from '../types'

export const Dashboard = () => {
  const navigate = useNavigate()
  const { vehicles, loading: vehiclesLoading, error: vehiclesError } = useVehicles()
  const { alerts, alertCount, addAlertFromEvent } = useAlerts()
  const [backendStatus, setBackendStatus] = useState<HealthCheck | null>(null)
  const [backendError, setBackendError] = useState<string | null>(null)

  const vehicleIds = vehicles.map(v => v.id)
  const {
    vehicleStates,
    loading: statesLoading,
    averageSpeed,
    activeVehicles,
    updateVehicleState,
  } = useVehicleRealtime(vehicleIds)

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
      updateVehicleState(data)
    },
  })

  return (
    <Layout alertCount={alertCount}>
      <div className="space-y-6">
        {/* Connection Status */}
        <div className="flex items-center gap-4">
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
        <StatsCards
          totalVehicles={vehicles.length}
          activeAlerts={alertCount}
          averageSpeed={averageSpeed}
          activeVehicles={activeVehicles}
          loading={vehiclesLoading || statesLoading}
        />

        {/* Fleet Map */}
        <FleetMap
          vehicles={vehicles}
          vehicleStates={vehicleStates}
          onVehicleSelect={(vehicleId) => navigate(`/vehicle/${vehicleId}`)}
        />

        {/* Two column layout for table and alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <VehiclesTable
              vehicles={vehicles}
              vehicleStates={vehicleStates}
              loading={vehiclesLoading}
              error={vehiclesError}
            />
          </div>
          <div>
            <AlertsPanel alerts={alerts} loading={false} />
          </div>
        </div>
      </div>
    </Layout>
  )
}