import { fetchAPI } from './api'
import type { TelemetryRequest, TelemetryResponse } from '../types'

export const telemetryService = {
  // Send telemetry event
  sendTelemetry: async (data: TelemetryRequest): Promise<TelemetryResponse> => {
    return fetchAPI<TelemetryResponse>('/api/v1/telemetry', {
      method: 'POST',
      body: data,
    })
  },
}

// Helper to generate unique event ID
export function generateEventId(): string {
  return `web_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
}