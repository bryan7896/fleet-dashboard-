import { fetchAPI } from './api'
import type { HealthCheck } from '../types'

export const healthService = {
  check: async (): Promise<HealthCheck> => {
    return fetchAPI<HealthCheck>('/health')
  },
}