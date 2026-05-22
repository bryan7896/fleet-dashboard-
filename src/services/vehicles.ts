import { fetchAPI } from './api'
import type { Vehicle, VehicleState, VehicleMetrics, TelemetryHistory, CreateVehicleRequest } from '../types'

export const vehiclesService = {
  // Get all vehicles
  getAll: async (): Promise<Vehicle[]> => {
    return fetchAPI<Vehicle[]>('/vehicles')
  },

  // Get vehicle by ID
  getById: async (id: string): Promise<Vehicle> => {
    return fetchAPI<Vehicle>(`/vehicles/${id}`)
  },

  // Create new vehicle
  create: async (data: CreateVehicleRequest): Promise<Vehicle> => {
    return fetchAPI<Vehicle>('/vehicles', {
      method: 'POST',
      body: data,
    })
  },

  // Get current state of vehicle
  getState: async (vehicleId: string): Promise<VehicleState> => {
    return fetchAPI<VehicleState>(`/vehicles/${vehicleId}/state`)
  },

  // Get vehicle metrics
  getMetrics: async (vehicleId: string): Promise<VehicleMetrics> => {
    return fetchAPI<VehicleMetrics>(`/vehicles/${vehicleId}/metrics`)
  },

  // Get telemetry history
  getTelemetryHistory: async (vehicleId: string): Promise<TelemetryHistory[]> => {
    return fetchAPI<TelemetryHistory[]>(`/vehicles/${vehicleId}/telemetry`)
  },
}