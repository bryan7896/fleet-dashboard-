import { useState, useEffect, useCallback } from 'react'
import { alertsService } from '../services/alerts'
import type { Alert, AlertCreatedEvent } from '../types'
import { ALERTS_POLLING_INTERVAL } from '../utils/constants'

export function useAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [latestAlert, setLatestAlert] = useState<AlertCreatedEvent | null>(null)

  const fetchAlerts = useCallback(async () => {
    try {
      const response = await alertsService.getActive()
      setAlerts(response.items)
      setError(null)
    } catch (err) {
      console.error('Failed to fetch alerts:', err)
      setError('No se pudieron cargar las alertas')
    } finally {
      setLoading(false)
    }
  }, [])

  const addAlertFromEvent = useCallback((event: AlertCreatedEvent) => {
    setLatestAlert(event)
    const newAlert: Alert = {
      alertId: `temp_${Date.now()}`,
      vehicleId: event.vehicleId,
      type: event.type,
      severity: event.severity as Alert['severity'],
      message: event.message,
      createdAtUtc: event.createdAtUtc,
    }
    setAlerts(prev => {
      // Check if alert already exists (avoid duplicates)
      const exists = prev.some(a => a.vehicleId === event.vehicleId && a.type === event.type)
      if (exists) return prev
      return [newAlert, ...prev]
    })
  }, [])

  // Polling for alerts
  useEffect(() => {
    fetchAlerts()
    const interval = setInterval(fetchAlerts, ALERTS_POLLING_INTERVAL)
    return () => clearInterval(interval)
  }, [fetchAlerts])

  return {
    alerts,
    loading,
    error,
    latestAlert,
    addAlertFromEvent,
    fetchAlerts,
    alertCount: alerts.length,
  }
}