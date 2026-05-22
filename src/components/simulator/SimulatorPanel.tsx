import { useState, useRef, useEffect } from 'react'
import { vehiclesService } from '../../services/vehicles'
import { telemetryService, generateEventId } from '../../services/telemetry'
import { useToast } from '../common/Toast'
import type { Vehicle } from '../../types'

interface SimulatorPanelProps {
  onVehicleCreated?: (vehicle: Vehicle) => void
  onTelemetrySent?: () => void
  existingVehicles: Vehicle[]
}

export const SimulatorPanel = ({ onVehicleCreated, onTelemetrySent, existingVehicles }: SimulatorPanelProps) => {
  const { showToast } = useToast()
  const [isExpanded, setIsExpanded] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [simulating, setSimulating] = useState(false)
  const simulationInterval = useRef<ReturnType<typeof setInterval> | null>(null)

  // Form states
  const [plate, setPlate] = useState('')
  const [alias, setAlias] = useState('')
  const [selectedVehicleId, setSelectedVehicleId] = useState('')
  const [lat, setLat] = useState(4.711)
  const [lng, setLng] = useState(-74.0721)
  const [speed, setSpeed] = useState(60)

  // Refs para mantener valores actualizados en el intervalo de simulación
  const latRef = useRef(lat)
  const lngRef = useRef(lng)
  const speedRef = useRef(speed)
  const selectedVehicleIdRef = useRef(selectedVehicleId)

  useEffect(() => {
    latRef.current = lat
    lngRef.current = lng
    speedRef.current = speed
  }, [lat, lng, speed])

  useEffect(() => {
    selectedVehicleIdRef.current = selectedVehicleId
  }, [selectedVehicleId])

  // Limpiar intervalo al desmontar
  useEffect(() => {
    return () => {
      if (simulationInterval.current) {
        clearInterval(simulationInterval.current)
      }
    }
  }, [])

  const handleCreateVehicle = async () => {
    if (!plate.trim() || !alias.trim()) {
      showToast('Placa y alias son requeridos', 'warning')
      return
    }
    setIsCreating(true)
    try {
      const newVehicle = await vehiclesService.create({ plate, alias })
      console.log('Vehicle created:', newVehicle)
      onVehicleCreated?.(newVehicle)
      setPlate('')
      setAlias('')
      showToast(`Vehículo ${newVehicle.plate} creado exitosamente`, 'success')
    } catch (err) {
      console.error('Failed to create vehicle:', err)
      showToast('Error al crear vehículo', 'error')
    } finally {
      setIsCreating(false)
    }
  }

  const handleSendTelemetry = async () => {
    if (!selectedVehicleId) {
      showToast('Selecciona un vehículo', 'warning')
      return
    }
    setIsSending(true)
    try {
      const result = await telemetryService.sendTelemetry({
        vehicleId: selectedVehicleId,
        externalEventId: generateEventId(),
        capturedAtUtc: new Date().toISOString(),
        latitude: lat,
        longitude: lng,
        speedKph: speed,
        ignitionOn: speed > 0,
      })
      console.log('Telemetry sent:', result)
      onTelemetrySent?.()
      if (result.accepted) {
        showToast(`Telemetría enviada a ${selectedVehicleId.slice(0, 8)}`, 'success')
      } else {
        showToast(`Telemetría rechazada: ${result.message}`, 'warning')
      }
    } catch (err) {
      console.error('Failed to send telemetry:', err)
      showToast('Error al enviar telemetría', 'error')
    } finally {
      setIsSending(false)
    }
  }

  const startSimulation = () => {
    if (!selectedVehicleId) {
      showToast('Selecciona un vehículo para simular movimiento', 'warning')
      return
    }
    if (simulationInterval.current) clearInterval(simulationInterval.current)
    setSimulating(true)
    showToast(`Simulación iniciada para vehículo ${selectedVehicleId.slice(0, 8)}`, 'info')

    // Usamos refs para capturar valores actualizados en cada ciclo
    simulationInterval.current = setInterval(() => {
      // Generar nuevos valores
      const newLat = latRef.current + (Math.random() - 0.5) * 0.01
      const newLng = lngRef.current + (Math.random() - 0.5) * 0.01
      const newSpeed = Math.floor(Math.random() * 120) + 20

      // Actualizar estado (para que el formulario se vea actualizado)
      setLat(newLat)
      setLng(newLng)
      setSpeed(newSpeed)

      // Enviar telemetría con los nuevos valores
      telemetryService.sendTelemetry({
        vehicleId: selectedVehicleIdRef.current,
        externalEventId: generateEventId(),
        capturedAtUtc: new Date().toISOString(),
        latitude: newLat,
        longitude: newLng,
        speedKph: newSpeed,
        ignitionOn: true,
      }).catch(err => {
        console.error('Simulation telemetry error:', err)
        showToast('Error enviando telemetría en simulación', 'error')
      })
    }, 2000)
  }

  const stopSimulation = () => {
    if (simulationInterval.current) {
      clearInterval(simulationInterval.current)
      simulationInterval.current = null
    }
    setSimulating(false)
    showToast('Simulación detenida', 'info')
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isExpanded ? (
        <button
          onClick={() => setIsExpanded(true)}
          className="bg-primary-600 hover:bg-primary-700 text-white rounded-full p-4 shadow-lg transition-all"
        >
          <span className="text-2xl">🛠️</span>
        </button>
      ) : (
        <div className="bg-gray-800 rounded-lg shadow-xl w-96 border border-gray-700">
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <h3 className="font-semibold text-white">Panel de Simulación</h3>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>
          <div className="p-4 space-y-4 max-h-[80vh] overflow-y-auto">
            {/* Create Vehicle Section */}
            <div>
              <h4 className="text-sm font-medium text-gray-300 mb-2">Crear Vehículo</h4>
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Placa (ej: ABC123)"
                  value={plate}
                  onChange={(e) => setPlate(e.target.value.toUpperCase())}
                  className="input w-full text-sm"
                />
                <input
                  type="text"
                  placeholder="Alias (ej: Camión Norte)"
                  value={alias}
                  onChange={(e) => setAlias(e.target.value)}
                  className="input w-full text-sm"
                />
                <button
                  onClick={handleCreateVehicle}
                  disabled={isCreating}
                  className="btn-primary w-full text-sm"
                >
                  {isCreating ? 'Creando...' : '➕ Crear Vehículo'}
                </button>
              </div>
            </div>

            <hr className="border-gray-700" />

            {/* Send Telemetry Section */}
            <div>
              <h4 className="text-sm font-medium text-gray-300 mb-2">Enviar Telemetría</h4>
              <div className="space-y-2">
                <select
                  value={selectedVehicleId}
                  onChange={(e) => setSelectedVehicleId(e.target.value)}
                  className="input w-full text-sm"
                >
                  <option value="">Selecciona un vehículo</option>
                  {existingVehicles.map(v => (
                    <option key={v.id} value={v.id}>{v.plate} - {v.alias}</option>
                  ))}
                </select>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    step="0.001"
                    placeholder="Latitud"
                    value={lat}
                    onChange={(e) => setLat(parseFloat(e.target.value))}
                    className="input text-sm"
                  />
                  <input
                    type="number"
                    step="0.001"
                    placeholder="Longitud"
                    value={lng}
                    onChange={(e) => setLng(parseFloat(e.target.value))}
                    className="input text-sm"
                  />
                </div>
                <input
                  type="number"
                  placeholder="Velocidad (km/h)"
                  value={speed}
                  onChange={(e) => setSpeed(parseInt(e.target.value))}
                  className="input w-full text-sm"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSendTelemetry}
                    disabled={isSending || !selectedVehicleId}
                    className="btn-primary flex-1 text-sm"
                  >
                    {isSending ? 'Enviando...' : '📡 Enviar Telemetría'}
                  </button>
                  {!simulating ? (
                    <button
                      onClick={startSimulation}
                      disabled={!selectedVehicleId}
                      className="btn-secondary flex-1 text-sm"
                    >
                      ▶️ Simular
                    </button>
                  ) : (
                    <button
                      onClick={stopSimulation}
                      className="bg-red-600 hover:bg-red-700 flex-1 text-sm text-white rounded-lg"
                    >
                      ⏹️ Detener
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}