// Vehicle types
export interface Vehicle {
  id: string
  plate: string
  alias: string
  isActive: boolean
  createdAtUtc: string
}

export interface VehicleState {
  vehicleId: string
  status: 'Stopped' | 'Moving' | 'Idle' | 'Offline'
  lastLatitude: number
  lastLongitude: number
  lastSpeedKph: number
  lastTelemetryAtUtc: string
}

export interface VehicleMetrics {
  vehicleId: string
  totalTelemetryEvents: number
  averageSpeedKph: number
  maxSpeedKph: number
  lastTelemetryAtUtc: string
}

export interface TelemetryHistory {
  capturedAtUtc: string
  latitude: number
  longitude: number
  speedKph: number
  ignitionOn: boolean
}

// Telemetry types
export interface TelemetryRequest {
  vehicleId: string
  externalEventId: string
  capturedAtUtc: string
  latitude: number
  longitude: number
  speedKph: number
  ignitionOn: boolean
}

export interface TelemetryResponse {
  telemetryEventId: string
  accepted: boolean
  isDuplicate: boolean
  processedAtUtc: string
  message: string
}

// Alert types
export interface Alert {
  alertId: string
  vehicleId: string
  type: string
  severity: 'Low' | 'Medium' | 'High' | 'Critical'
  message: string
  createdAtUtc: string
}

export interface ActiveAlertsResponse {
  count: number
  items: Alert[]
}

// AI types
export interface AIRequest {
  question: string
}

export interface AIResponse {
  answer: string
}

// Health check
export interface HealthCheck {
  status: string
  service: string
  utc: string
}

// Create vehicle request
export interface CreateVehicleRequest {
  plate: string
  alias: string
}

// SignalR events
export interface TelemetryReceivedEvent {
  vehicleId: string
  latitude: number
  longitude: number
  speedKph: number
  capturedAtUtc: string
}

export interface AlertCreatedEvent {
  vehicleId: string
  type: string
  severity: string
  message: string
  createdAtUtc: string
}