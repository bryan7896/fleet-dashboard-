import { useEffect, useCallback, useRef, useState } from 'react'
import { signalRClient } from '../services/signalr'
import type { TelemetryReceivedEvent, AlertCreatedEvent } from '../types'

interface UseSignalROptions {
  onTelemetryReceived?: (data: TelemetryReceivedEvent) => void
  onAlertCreated?: (data: AlertCreatedEvent) => void
  onConnected?: () => void
  onDisconnected?: (error?: Error) => void
  onReconnecting?: (error?: Error) => void
  onReconnected?: (connectionId?: string) => void
  autoConnect?: boolean
}

export function useSignalR({ 
  onTelemetryReceived, 
  onAlertCreated,
  onConnected,
  onDisconnected,
  onReconnecting,
  onReconnected,
  autoConnect = true 
}: UseSignalROptions = {}) {
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  
  // Refs para almacenar los callbacks (evitan cambios de dependencias)
  const handlersRef = useRef({ 
    onTelemetryReceived, 
    onAlertCreated,
    onConnected,
    onDisconnected,
    onReconnecting,
    onReconnected
  })
  
  // Ref para evitar múltiples intentos de conexión simultáneos
  const connectionAttemptRef = useRef(false)

  // Actualizar refs cuando cambian los callbacks
  useEffect(() => {
    handlersRef.current = { 
      onTelemetryReceived, 
      onAlertCreated,
      onConnected,
      onDisconnected,
      onReconnecting,
      onReconnected
    }
  })

  // Función de conexión estable (no depende de estados que cambien)
  const connect = useCallback(async () => {
    // Evitar múltiples conexiones simultáneas
    if (connectionAttemptRef.current) return
    if (signalRClient.getConnectionStatus()) {
      setIsConnected(true)
      return
    }
    
    connectionAttemptRef.current = true
    setIsConnecting(true)
    
    try {
      await signalRClient.start({
        onConnected: () => {
          setIsConnected(true)
          handlersRef.current.onConnected?.()
        },
        onDisconnected: (error) => {
          setIsConnected(false)
          handlersRef.current.onDisconnected?.(error)
        },
        onReconnecting: (error) => {
          handlersRef.current.onReconnecting?.(error)
        },
        onReconnected: (connectionId) => {
          setIsConnected(true)
          handlersRef.current.onReconnected?.(connectionId)
        },
        onTelemetryReceived: (data) => {
          handlersRef.current.onTelemetryReceived?.(data)
        },
        onAlertCreated: (data) => {
          handlersRef.current.onAlertCreated?.(data)
        },
      })
    } catch (error) {
      console.error('[useSignalR] Failed to connect', error)
      setIsConnected(false)
      handlersRef.current.onDisconnected?.(error as Error)
    } finally {
      setIsConnecting(false)
      connectionAttemptRef.current = false
    }
  }, []) // Sin dependencias externas

  const disconnect = useCallback(async () => {
    await signalRClient.stop()
    setIsConnected(false)
    setIsConnecting(false)
    connectionAttemptRef.current = false
  }, [])

  // Auto-conectar al montar
  useEffect(() => {
    if (autoConnect) {
      connect()
    }
    return () => {
      disconnect()
    }
  }, [autoConnect, connect, disconnect]) // connect y disconnect son estables

  return {
    isConnected,
    isConnecting,
    connect,
    disconnect,
  }
}