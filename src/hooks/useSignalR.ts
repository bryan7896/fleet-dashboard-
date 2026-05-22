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
  
  // Refs para mantener los callbacks actualizados sin causar reconexiones
  const handlersRef = useRef({ 
    onTelemetryReceived, 
    onAlertCreated,
    onConnected,
    onDisconnected,
    onReconnecting,
    onReconnected
  })

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
  }, [onTelemetryReceived, onAlertCreated, onConnected, onDisconnected, onReconnecting, onReconnected])

  const connect = useCallback(async () => {
    if (signalRClient.getConnectionStatus() || isConnecting) return

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
      handlersRef.current.onDisconnected?.(error as Error)
    } finally {
      setIsConnecting(false)
    }
  }, [isConnecting]) 

  const disconnect = useCallback(async () => {
    await signalRClient.stop()
    setIsConnected(false)
  }, [])

  useEffect(() => {
    if (autoConnect) {
      connect()
    }
    return () => {
      disconnect()
    }
  }, [autoConnect, connect, disconnect])

  return {
    isConnected,
    isConnecting,
    connect,
    disconnect,
  }
}