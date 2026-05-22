import { useEffect, useState, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Layout } from '../components/layout/Layout'
import { StatsCards } from '../components/dashboard/StatsCards'
import { VehiclesTable } from '../components/dashboard/VehiclesTable'
import { AlertsPanel } from '../components/dashboard/AlertsPanel'
import { FleetMap } from '../components/dashboard/FleetMap'
import { SimulatorPanel } from '../components/simulator/SimulatorPanel'
import { useVehicles } from '../hooks/useVehicles'
import { useAlerts } from '../hooks/useAlerts'
import { useSignalR } from '../hooks/useSignalR'
import { useVehicleRealtime } from '../hooks/useVehicleRealtime'
import { useToast } from '../components/common/Toast'
import { healthService } from '../services/health'
import type { HealthCheck } from '../types'

export const Dashboard = () => {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { vehicles, loading: vehiclesLoading, error: vehiclesError, fetchVehicles } = useVehicles()
  const { alerts, alertCount, addAlertFromEvent, fetchAlerts } = useAlerts()
  const [backendStatus, setBackendStatus] = useState<HealthCheck | null>(null)
  const [backendError, setBackendError] = useState<string | null>(null)

  // ✅ Memoizar vehicleIds para evitar que cambie la referencia en cada render
  const vehicleIds = useMemo(() => vehicles.map(v => v.id), [vehicles])

  const {
    vehicleStates,
    loading: statesLoading,
    averageSpeed,
    activeVehicles,
    updateVehicleState,
  } = useVehicleRealtime(vehicleIds)

  // Refresh vehicles after creating a new one
  const handleVehicleCreated = useCallback(() => {
    fetchVehicles()
    showToast('Vehículo creado correctamente', 'success')
  }, [fetchVehicles, showToast])

  // ✅ Check backend health - sin dependencias (solo montar)
  useEffect(() => {
    let isMounted = true
    const checkHealth = async () => {
      try {
        const result = await healthService.check()
        if (isMounted) {
          setBackendStatus(result)
          setBackendError(null)
        }
      } catch (err) {
        console.error('Backend health check failed:', err)
        if (isMounted) {
          setBackendError('Backend no disponible')
          showToast('No se pudo conectar con el backend', 'error')
        }
      }
    }
    checkHealth()
    const interval = setInterval(checkHealth, 30000)
    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, []) // ✅ Dependencias vacías, showToast se usa dentro pero no la incluimos

  // SignalR connection with reconnect button support
  const { isConnected: signalRConnected, connect: reconnectSignalR, isConnecting } = useSignalR({
    onAlertCreated: (data) => {
      console.log('Alert received:', data)
      addAlertFromEvent(data)
      showToast(`Nueva alerta: ${data.type}`, 'warning')
    },
    onTelemetryReceived: (data) => {
      console.log('Telemetry received:', data)
      updateVehicleState(data)
    },
    onConnected: () => {
      showToast('Conexión en tiempo real establecida', 'success')
    },
    onDisconnected: () => {
      showToast('Conexión en tiempo real perdida', 'error')
    },
    onReconnected: () => {
      showToast('Conexión en tiempo real restablecida', 'success')
    },
  })

  const handleReconnect = () => {
    reconnectSignalR()
    showToast('Intentando reconectar...', 'info')
  }

  const handleRefreshAlerts = () => {
    fetchAlerts()
    showToast('Alertas actualizadas', 'info')
  }

  return (
    <Layout alertCount={alertCount}>
      <div className="space-y-6">
        {/* Connection Status */}
        <div className="flex flex-wrap items-center justify-between gap-4">
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
                Realtime: {signalRConnected ? 'Conectado' : isConnecting ? 'Conectando...' : 'Desconectado'}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            {!signalRConnected && !isConnecting && (
              <button
                onClick={handleReconnect}
                className="text-xs bg-primary-600 hover:bg-primary-700 px-3 py-1 rounded text-white transition-colors"
              >
                🔌 Reconectar WebSocket
              </button>
            )}
            <button
              onClick={handleRefreshAlerts}
              className="text-xs bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded text-gray-300 transition-colors"
            >
              🔄 Refrescar Alertas
            </button>
          </div>
        </div>

        <StatsCards
          totalVehicles={vehicles.length}
          activeAlerts={alertCount}
          averageSpeed={averageSpeed}
          activeVehicles={activeVehicles}
          loading={vehiclesLoading || statesLoading}
        />

        <FleetMap
          vehicles={vehicles}
          vehicleStates={vehicleStates}
          onVehicleSelect={(vehicleId) => navigate(`/vehicle/${vehicleId}`)}
        />

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
            <AlertsPanel
              alerts={alerts}
              loading={false}
              onRefresh={handleRefreshAlerts}
            />
          </div>
        </div>
      </div>

      <SimulatorPanel
        onVehicleCreated={handleVehicleCreated}
        onTelemetrySent={() => showToast('Telemetría enviada', 'success')}
        existingVehicles={vehicles}
      />
    </Layout>
  )
}