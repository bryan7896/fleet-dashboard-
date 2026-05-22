// API Endpoints
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://localhost:7206'
export const SIGNALR_HUB_URL = import.meta.env.VITE_SIGNALR_URL || 'https://localhost:7206/hubs/fleet'
export const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''

// App Constants
export const APP_NAME = 'Fleet Monitoring Platform'
export const APP_VERSION = '1.0.0'

// Refresh intervals (ms)
export const ALERTS_POLLING_INTERVAL = 15000 // 15 seconds
export const VEHICLES_POLLING_INTERVAL = 30000 // 30 seconds

// Map defaults
export const DEFAULT_MAP_CENTER = { lat: 4.711, lng: -74.0721 } // Bogotá
export const DEFAULT_MAP_ZOOM = 12

// Alert severity colors
export const SEVERITY_COLORS = {
  Low: 'bg-green-500',
  Medium: 'bg-yellow-500',
  High: 'bg-red-500',
  Critical: 'bg-purple-600'
} as const

// Alert type labels
export const ALERT_TYPE_LABELS = {
  HIGH_SPEED: '🚗 Exceso de Velocidad',
  LOW_BATTERY: '🔋 Batería Baja',
  MAINTENANCE: '🔧 Mantenimiento Requerido',
  COLLISION: '💥 Colisión Detectada'
} as Record<string, string>