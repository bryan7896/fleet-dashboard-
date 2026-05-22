import { useState, useEffect, useCallback } from 'react'
import type { VehicleState, TelemetryReceivedEvent } from '../types'
import { vehiclesService } from '../services/vehicles'

export function useVehicleRealtime(vehicleIds: string[]) {
  const [vehicleStates, setVehicleStates] = useState<Map<string, VehicleState>>(new Map())
  const [loading, setLoading] = useState(true)
  const [averageSpeed, setAverageSpeed] = useState(0)
  const [activeVehicles, setActiveVehicles] = useState(0)

  const fetchAllStates = useCallback(async () => {
    const newStates = new Map<string, VehicleState>()
    let totalSpeed = 0
    let movingCount = 0

    for (const id of vehicleIds) {
      try {
        const state = await vehiclesService.getState(id)
        if (state) {
          newStates.set(id, state)
          if (state.lastSpeedKph > 0) {
            totalSpeed += state.lastSpeedKph
            movingCount++
          }
        }
      } catch (err) {
        console.error(`Failed to fetch state for vehicle ${id}:`, err)
      }
    }

    setVehicleStates(newStates)
    setAverageSpeed(movingCount > 0 ? Math.round(totalSpeed / movingCount) : 0)
    setActiveVehicles(movingCount)
    setLoading(false)
  }, [vehicleIds])

  const updateVehicleState = useCallback((event: TelemetryReceivedEvent) => {
    setVehicleStates((prev) => {
      const newStates = new Map(prev)
      const existingState = newStates.get(event.vehicleId)
      const updatedState: VehicleState = {
        vehicleId: event.vehicleId,
        status: existingState?.status || 'Moving',
        lastLatitude: event.latitude,
        lastLongitude: event.longitude,
        lastSpeedKph: event.speedKph,
        lastTelemetryAtUtc: event.capturedAtUtc,
      }
      newStates.set(event.vehicleId, updatedState)

      // Recalculate averages
      let totalSpeed = 0
      let movingCount = 0
      newStates.forEach((state) => {
        if (state.lastSpeedKph > 0) {
          totalSpeed += state.lastSpeedKph
          movingCount++
        }
      })
      setAverageSpeed(movingCount > 0 ? Math.round(totalSpeed / movingCount) : 0)
      setActiveVehicles(movingCount)

      return newStates
    })
  }, [])

  useEffect(() => {
    if (vehicleIds.length > 0) {
      fetchAllStates()
    }
  }, [fetchAllStates, vehicleIds])

  return {
    vehicleStates,
    loading,
    averageSpeed,
    activeVehicles,
    updateVehicleState,
    refreshStates: fetchAllStates,
  }
}