import { useCallback, useMemo } from 'react'
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

export const FleetMap = ({ vehicles, vehicleStates, onVehicleSelect }: FleetMapProps) => {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: ['places'],
  })

  const center = useMemo(() => DEFAULT_MAP_CENTER, [])

  // Filter vehicles that have valid position data
  const vehiclesWithPosition = useMemo(() => {
    return vehicles.filter((vehicle) => {
      const state = vehicleStates.get(vehicle.id)
      return state && state.lastLatitude && state.lastLongitude
    })
  }, [vehicles, vehicleStates])

  const getMarkerColor = (status: string) => {
    switch (status) {
      case 'Moving':
        return '#22c55e' // green
      case 'Stopped':
        return '#6b7280' // gray
      case 'Idle':
        return '#eab308' // yellow
      default:
        return '#3b82f6' // blue
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
      <h2 className="text-lg font-semibold text-white mb-4">
        Mapa de Flota
        <span className="text-sm text-gray-400 ml-2">
          ({vehiclesWithPosition.length} vehículos en mapa)
        </span>
      </h2>
      <div className="bg-gray-700 rounded-lg overflow-hidden h-[450px]">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={center}
          zoom={DEFAULT_MAP_ZOOM}
          options={{
            styles: [
              {
                featureType: 'all',
                elementType: 'labels.text.fill',
                stylers: [{ color: '#ffffff' }],
              },
              {
                featureType: 'all',
                elementType: 'labels.text.stroke',
                stylers: [{ color: '#000000' }, { lightness: 13 }],
              },
              {
                featureType: 'all',
                elementType: 'labels.icon',
                stylers: [{ visibility: 'off' }],
              },
              {
                featureType: 'administrative',
                elementType: 'geometry.fill',
                stylers: [{ color: '#000000' }],
              },
              {
                featureType: 'administrative',
                elementType: 'geometry.stroke',
                stylers: [{ color: '#144b53' }, { lightness: 14 }],
              },
              {
                featureType: 'landscape',
                elementType: 'all',
                stylers: [{ color: '#08304b' }],
              },
              {
                featureType: 'poi',
                elementType: 'geometry',
                stylers: [{ color: '#0c4152' }, { lightness: 5 }],
              },
              {
                featureType: 'road.highway',
                elementType: 'geometry.fill',
                stylers: [{ color: '#000000' }],
              },
              {
                featureType: 'road.highway',
                elementType: 'geometry.stroke',
                stylers: [{ color: '#0b434f' }, { lightness: 25 }],
              },
              {
                featureType: 'road.arterial',
                elementType: 'geometry.fill',
                stylers: [{ color: '#000000' }],
              },
              {
                featureType: 'road.arterial',
                elementType: 'geometry.stroke',
                stylers: [{ color: '#0b3d4a' }, { lightness: 16 }],
              },
              {
                featureType: 'road.local',
                elementType: 'geometry',
                stylers: [{ color: '#000000' }],
              },
              {
                featureType: 'transit',
                elementType: 'all',
                stylers: [{ color: '#146474' }],
              },
              {
                featureType: 'water',
                elementType: 'all',
                stylers: [{ color: '#021019' }],
              },
            ],
          }}
        >
          {vehiclesWithPosition.map((vehicle) => {
            const state = vehicleStates.get(vehicle.id)!
            return (
              <Marker
                key={vehicle.id}
                position={{
                  lat: state.lastLatitude,
                  lng: state.lastLongitude,
                }}
                icon={{
                  path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z',
                  fillColor: getMarkerColor(state.status),
                  fillOpacity: 1,
                  strokeColor: '#ffffff',
                  strokeWeight: 2,
                  scale: 1.2,
                  anchor: { x: 12, y: 24 } as google.maps.Point,
                }}
                onClick={() => onVehicleSelect?.(vehicle.id)}
                title={`${vehicle.alias || vehicle.plate} - ${state.lastSpeedKph} km/h`}
              />
            )
          })}
        </GoogleMap>
      </div>
    </div>
  )
}