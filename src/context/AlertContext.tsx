import { createContext, useContext, useState, useCallback, useEffect, useRef, ReactNode } from 'react'
import type { Alert, AlertCreatedEvent } from '../types'

interface AlertContextValue {
    alerts: Alert[]
    alertCount: number
    addAlertFromEvent: (event: AlertCreatedEvent) => void
    fetchAlerts: () => Promise<void>
    loading: boolean
    error: string | null
}

const AlertContext = createContext<AlertContextValue | undefined>(undefined)

export const AlertProvider = ({ children }: { children: ReactNode }) => {
    const [alerts, setAlerts] = useState<Alert[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const initialFetchDone = useRef(false)

    const fetchAlerts = useCallback(async () => {
        setLoading(true)
        try {
            const { alertsService } = await import('../services/alerts')
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
        const newAlert: Alert = {
            alertId: `temp_${Date.now()}`,
            vehicleId: event.vehicleId,
            type: event.type,
            severity: event.severity as Alert['severity'],
            message: event.message,
            createdAtUtc: event.createdAtUtc,
            plate: event.plate,
        }
        setAlerts(prev => {
            const exists = prev.some(a => a.vehicleId === event.vehicleId && a.type === event.type)
            if (exists) return prev
            return [newAlert, ...prev]
        })
    }, [])

    // Cargar alertas iniciales al montar el proveedor (solo una vez)
    useEffect(() => {
        if (!initialFetchDone.current) {
            initialFetchDone.current = true
            fetchAlerts()
        }
    }, [fetchAlerts])

    const value = {
        alerts,
        alertCount: alerts.length,
        addAlertFromEvent,
        fetchAlerts,
        loading,
        error,
    }

    return <AlertContext.Provider value={value}>{children}</AlertContext.Provider>
}

export const useAlertsGlobal = () => {
    const context = useContext(AlertContext)
    if (!context) throw new Error('useAlertsGlobal must be used within AlertProvider')
    return context
}