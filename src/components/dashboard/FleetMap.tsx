import { useCallback, useMemo, useRef, useEffect, useState } from 'react'
import { GoogleMap, Marker, InfoWindow, useJsApiLoader } from '@react-google-maps/api'
import { GOOGLE_MAPS_API_KEY, DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM } from '../../utils/constants'
import type { Vehicle, VehicleState } from '../../types'
import { LoadingSpinner } from '../common/LoadingSpinner'

interface FleetMapProps {
  vehicles: Vehicle[]
  vehicleStates: Map<string, VehicleState>
  onVehicleSelect?: (vehicleId: string) => void
}

const mapContainerStyle = {
  width: '100%',
  height: '100%',
}

const mapOptions = {
  styles: [
    { featureType: 'all', elementType: 'labels.text.fill', stylers: [{ color: '#ffffff' }] },
    { featureType: 'all', elementType: 'labels.text.stroke', stylers: [{ color: '#000000' }, { lightness: 13 }] },
    { featureType: 'all', elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
    { featureType: 'administrative', elementType: 'geometry.fill', stylers: [{ color: '#000000' }] },
    { featureType: 'administrative', elementType: 'geometry.stroke', stylers: [{ color: '#144b53' }, { lightness: 14 }] },
    { featureType: 'landscape', elementType: 'all', stylers: [{ color: '#08304b' }] },
    { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#0c4152' }, { lightness: 5 }] },
    { featureType: 'road.highway', elementType: 'geometry.fill', stylers: [{ color: '#000000' }] },
    { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#0b434f' }, { lightness: 25 }] },
    { featureType: 'road.arterial', elementType: 'geometry.fill', stylers: [{ color: '#000000' }] },
    { featureType: 'road.arterial', elementType: 'geometry.stroke', stylers: [{ color: '#0b3d4a' }, { lightness: 16 }] },
    { featureType: 'road.local', elementType: 'geometry', stylers: [{ color: '#000000' }] },
    { featureType: 'transit', elementType: 'all', stylers: [{ color: '#146474' }] },
    { featureType: 'water', elementType: 'all', stylers: [{ color: '#021019' }] },
  ],
  zoomControl: true,
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: true,
}

export const FleetMap = ({ vehicles, vehicleStates, onVehicleSelect }: FleetMapProps) => {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: ['places'],
  })

  const mapRef = useRef<google.maps.Map | null>(null)
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null)

  // Vehicles with valid position
  const vehiclesWithPosition = useMemo(() => {
    return vehicles.filter((vehicle) => {
      const state = vehicleStates.get(vehicle.id)
      return state && state.lastLatitude && state.lastLongitude
    })
  }, [vehicles, vehicleStates])

  // Fit bounds to show all markers
  const fitMapToBounds = useCallback(() => {
    if (!mapRef.current || vehiclesWithPosition.length === 0) return

    const bounds = new google.maps.LatLngBounds()
    vehiclesWithPosition.forEach((vehicle) => {
      const state = vehicleStates.get(vehicle.id)
      if (state) {
        bounds.extend({ lat: state.lastLatitude, lng: state.lastLongitude })
      }
    })

    if (vehiclesWithPosition.length === 1) {
      const center = bounds.getCenter()
      mapRef.current.setCenter(center)
      mapRef.current.setZoom(14)
    } else {
      mapRef.current.fitBounds(bounds, 50)
    }
  }, [vehiclesWithPosition, vehicleStates])

  // Auto-fit when vehicles change
  useEffect(() => {
    if (isLoaded && vehiclesWithPosition.length > 0) {
      setTimeout(fitMapToBounds, 100)
    }
  }, [isLoaded, vehiclesWithPosition, fitMapToBounds])

  const onMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map
    fitMapToBounds()
  }, [fitMapToBounds])

  const getMarkerColor = (status: string) => {
    switch (status) {
      case 'Moving': return '#22c55e'
      case 'Stopped': return '#6b7280'
      case 'Idle': return '#eab308'
      default: return '#3b82f6'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'Moving': return 'En movimiento'
      case 'Stopped': return 'Detenido'
      case 'Idle': return 'Inactivo'
      default: return 'Desconocido'
    }
  }

  if (loadError) {
    return (
      <div className="card">
        <h2 className="text-lg font-semibold text-white mb-4">Mapa de Flota</h2>
        <div className="bg-gray-700 rounded-lg h-[400px] flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-400 mb-2">Error al cargar Google Maps</p>
            <p className="text-gray-400 text-sm">Verifica tu API Key en .env</p>
          </div>
        </div>
      </div>
    )
  }

  if (!isLoaded) {
    return (
      <div className="card">
        <h2 className="text-lg font-semibold text-white mb-4">Mapa de Flota</h2>
        <div className="bg-gray-700 rounded-lg h-[400px] flex items-center justify-center">
          <LoadingSpinner message="Cargando mapa..." />
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">
          Mapa de Flota
          <span className="text-sm text-gray-400 ml-2">
            ({vehiclesWithPosition.length} vehículos en mapa)
          </span>
        </h2>
        <button
          onClick={fitMapToBounds}
          className="text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 px-3 py-1 rounded transition-colors"
          title="Ajustar mapa a todos los vehículos"
        >
          🔍 Ver todos
        </button>
      </div>
      <div className="bg-gray-700 rounded-lg overflow-hidden h-[500px]">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={DEFAULT_MAP_CENTER}
          zoom={DEFAULT_MAP_ZOOM}
          options={mapOptions}
          onLoad={onMapLoad}
        >
          {vehiclesWithPosition.map((vehicle) => {
            const state = vehicleStates.get(vehicle.id)!
            return (
              <Marker
                key={vehicle.id}
                position={{ lat: state.lastLatitude, lng: state.lastLongitude }}
                icon={{
                  path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z',
                  fillColor: getMarkerColor(state.status),
                  fillOpacity: 1,
                  strokeColor: '#ffffff',
                  strokeWeight: 2,
                  scale: 1.2,
                  anchor: { x: 12, y: 24 } as google.maps.Point,
                }}
                onClick={() => {
                  setSelectedVehicleId(vehicle.id)
                  onVehicleSelect?.(vehicle.id)
                }}
                title={`${vehicle.alias || vehicle.plate} - ${state.lastSpeedKph} km/h`}
              />
            )
          })}

          {selectedVehicleId && vehicleStates.get(selectedVehicleId) && (() => {
            const vehicle = vehicles.find(v => v.id === selectedVehicleId)
            const state = vehicleStates.get(selectedVehicleId)
            if (!vehicle || !state) return null
            return (
              <InfoWindow
                position={{ lat: state.lastLatitude, lng: state.lastLongitude }}
                onCloseClick={() => setSelectedVehicleId(null)}
                options={{ pixelOffset: new google.maps.Size(0, -35) }}
              >
                <div className="text-black p-2 min-w-[200px]">
                  <div className="font-bold text-base">{vehicle.alias || vehicle.plate}</div>
                  <div className="text-sm mt-1">
                    <div>📊 Estado: {getStatusLabel(state.status)}</div>
                    <div>⚡ Velocidad: {state.lastSpeedKph} km/h</div>
                    <div>📍 {state.lastLatitude.toFixed(5)}, {state.lastLongitude.toFixed(5)}</div>
                    <div>🕒 {new Date(state.lastTelemetryAtUtc).toLocaleString()}</div>
                  </div>
                  <button
                    onClick={() => onVehicleSelect?.(vehicle.id)}
                    className="mt-2 text-xs bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded w-full"
                  >
                    Ver detalles
                  </button>
                </div>
              </InfoWindow>
            )
          })()}
        </GoogleMap>
      </div>
    </div>
  )
}