import { useEffect, useCallback, useRef, useState } from 'react'
import * as signalR from '@microsoft/signalr'
import { SIGNALR_HUB_URL } from '../utils/constants'
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

export function useSignalR(options: UseSignalROptions = {}) {
  const {
    onTelemetryReceived,
    onAlertCreated,
    onConnected,
    onDisconnected,
    onReconnecting,
    onReconnected,
    autoConnect = true,
  } = options

  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const connectionRef = useRef<signalR.HubConnection | null>(null)

  // Refs para callbacks (siempre actualizados)
  const handlersRef = useRef({
    onTelemetryReceived,
    onAlertCreated,
    onConnected,
    onDisconnected,
    onReconnecting,
    onReconnected,
  })

  useEffect(() => {
    handlersRef.current = {
      onTelemetryReceived,
      onAlertCreated,
      onConnected,
      onDisconnected,
      onReconnecting,
      onReconnected,
    }
  })

  const connect = useCallback(async () => {
    if (connectionRef.current) {
      // Ya hay una conexión activa
      if (connectionRef.current.state === signalR.HubConnectionState.Connected) {
        setIsConnected(true)
        return
      }
      // Intentar detener la anterior
      try {
        await connectionRef.current.stop()
      } catch (e) { /* ignore */ }
      connectionRef.current = null
    }

    setIsConnecting(true)

    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl(SIGNALR_HUB_URL, {
        transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.LongPolling,
      })
      .withAutomaticReconnect([0, 2000, 4000, 8000, 16000, 32000])
      .configureLogging(signalR.LogLevel.Information)
      .build()

    // Registrar eventos
    newConnection.on('telemetryReceived', (data: TelemetryReceivedEvent) => {
      handlersRef.current.onTelemetryReceived?.(data)
    })
    newConnection.on('alertCreated', (data: AlertCreatedEvent) => {
      handlersRef.current.onAlertCreated?.(data)
    })

    newConnection.onclose((error) => {
      setIsConnected(false)
      handlersRef.current.onDisconnected?.(error)
    })
    newConnection.onreconnecting((error) => {
      handlersRef.current.onReconnecting?.(error)
    })
    newConnection.onreconnected((connectionId) => {
      setIsConnected(true)
      handlersRef.current.onReconnected?.(connectionId)
    })

    try {
      await newConnection.start()
      setIsConnected(true)
      connectionRef.current = newConnection
      handlersRef.current.onConnected?.()
    } catch (err) {
      console.error('[useSignalR] Connection failed', err)
      setIsConnected(false)
      handlersRef.current.onDisconnected?.(err as Error)
    } finally {
      setIsConnecting(false)
    }
  }, [])

  const disconnect = useCallback(async () => {
    if (connectionRef.current) {
      await connectionRef.current.stop()
      connectionRef.current = null
      setIsConnected(false)
    }
  }, [])

  useEffect(() => {
    if (!autoConnect) return
    connect()
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