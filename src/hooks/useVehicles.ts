import { useState, useEffect, useCallback } from 'react'
import { vehiclesService } from '../services/vehicles'
import type { Vehicle, VehicleState, VehicleMetrics, TelemetryHistory } from '../types'

export function useVehicles() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchVehicles = useCallback(async () => {
    try {
      setLoading(true)
      const data = await vehiclesService.getAll()
      setVehicles(data)
      setError(null)
    } catch (err) {
      console.error('Failed to fetch vehicles:', err)
      setError('No se pudieron cargar los vehículos')
    } finally {
      setLoading(false)
    }
  }, [])

  const createVehicle = useCallback(async (plate: string, alias: string) => {
    try {
      const newVehicle = await vehiclesService.create({ plate, alias })
      setVehicles(prev => [...prev, newVehicle])
      return newVehicle
    } catch (err) {
      console.error('Failed to create vehicle:', err)
      throw err
    }
  }, [])

  const getVehicleState = useCallback(async (vehicleId: string): Promise<VehicleState | null> => {
    try {
      return await vehiclesService.getState(vehicleId)
    } catch (err) {
      console.error('Failed to get vehicle state:', err)
      return null
    }
  }, [])

  const getVehicleMetrics = useCallback(async (vehicleId: string): Promise<VehicleMetrics | null> => {
    try {
      return await vehiclesService.getMetrics(vehicleId)
    } catch (err) {
      console.error('Failed to get vehicle metrics:', err)
      return null
    }
  }, [])

  const getVehicleHistory = useCallback(async (vehicleId: string): Promise<TelemetryHistory[]> => {
    try {
      return await vehiclesService.getTelemetryHistory(vehicleId)
    } catch (err) {
      console.error('Failed to get vehicle history:', err)
      return []
    }
  }, [])

  useEffect(() => {
    fetchVehicles()
  }, [fetchVehicles])

  return {
    vehicles,
    loading,
    error,
    fetchVehicles,
    createVehicle,
    getVehicleState,
    getVehicleMetrics,
    getVehicleHistory,
  }
}