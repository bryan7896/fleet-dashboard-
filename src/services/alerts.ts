import { fetchAPI } from './api'
import type { Alert, ActiveAlertsResponse } from '../types'

export const alertsService = {
  // Get active alerts
  getActive: async (): Promise<ActiveAlertsResponse> => {
    return fetchAPI<ActiveAlertsResponse>('/api/v1/alerts/active')
  },

  // Get all alerts (if endpoint exists, otherwise just active)
  getAll: async (): Promise<Alert[]> => {
    const response = await fetchAPI<ActiveAlertsResponse>('/api/v1/alerts/active')
    return response.items
  },
}