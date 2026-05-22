import { useEffect, useCallback, useRef, useState } from 'react'
import { signalRClient } from '../services/signalr'
import type { TelemetryReceivedEvent, AlertCreatedEvent } from '../types'

interface UseSignalROptions {
  onTelemetryReceived?: (data: TelemetryReceivedEvent) => void
  onAlertCreated?: (data: AlertCreatedEvent) => void
  autoConnect?: boolean
}

export function useSignalR({ 
  onTelemetryReceived, 
  onAlertCreated, 
  autoConnect = true 
}: UseSignalROptions = {}) {
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const handlersRef = useRef({ onTelemetryReceived, onAlertCreated })

  // Update handlers ref when they change
  useEffect(() => {
    handlersRef.current = { onTelemetryReceived, onAlertCreated }
  }, [onTelemetryReceived, onAlertCreated])

  const connect = useCallback(async () => {
    if (signalRClient.getConnectionStatus() || isConnecting) return

    setIsConnecting(true)
    try {
      await signalRClient.start({
        onConnected: () => {
          setIsConnected(true)
          console.log('[useSignalR] Connected')
        },
        onDisconnected: (error) => {
          setIsConnected(false)
          console.log('[useSignalR] Disconnected', error)
        },
        onReconnecting: (error) => {
          console.log('[useSignalR] Reconnecting', error)
        },
        onReconnected: (connectionId) => {
          setIsConnected(true)
          console.log('[useSignalR] Reconnected', connectionId)
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