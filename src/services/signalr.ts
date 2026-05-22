import * as signalR from '@microsoft/signalr'
import { SIGNALR_HUB_URL } from '../utils/constants'
import type { TelemetryReceivedEvent, AlertCreatedEvent } from '../types'

export type SignalREventHandler = {
  onTelemetryReceived?: (data: TelemetryReceivedEvent) => void
  onAlertCreated?: (data: AlertCreatedEvent) => void
  onConnected?: () => void
  onDisconnected?: (error?: Error) => void
  onReconnecting?: (error?: Error) => void
  onReconnected?: (connectionId?: string) => void
}

class SignalRClient {
  private connection: signalR.HubConnection | null = null
  private isConnected = false
  private handlers: SignalREventHandler = {}

  async start(handlers: SignalREventHandler): Promise<void> {
    this.handlers = handlers

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(SIGNALR_HUB_URL, {
        transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.LongPolling,
      })
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: (retryContext) => {
          // Exponential backoff: 2s, 4s, 8s, 16s, 32s, then every 32s
          const delays = [2000, 4000, 8000, 16000, 32000]
          if (retryContext.previousRetryCount === undefined) return 2000
          if (retryContext.previousRetryCount < delays.length) {
            return delays[retryContext.previousRetryCount]
          }
          return 32000
        },
      })
      .configureLogging(signalR.LogLevel.Information)
      .build()

    // Register event handlers
    this.connection.on('telemetryReceived', (data: TelemetryReceivedEvent) => {
      console.log('[SignalR] telemetryReceived', data)
      this.handlers.onTelemetryReceived?.(data)
    })

    this.connection.on('alertCreated', (data: AlertCreatedEvent) => {
      console.log('[SignalR] alertCreated', data)
      this.handlers.onAlertCreated?.(data)
    })

    // Connection event handlers
    this.connection.onclose((error) => {
      this.isConnected = false
      console.log('[SignalR] Disconnected', error)
      this.handlers.onDisconnected?.(error)
    })

    this.connection.onreconnecting((error) => {
      console.log('[SignalR] Reconnecting', error)
      this.handlers.onReconnecting?.(error)
    })

    this.connection.onreconnected((connectionId) => {
      this.isConnected = true
      console.log('[SignalR] Reconnected', connectionId)
      this.handlers.onReconnected?.(connectionId)
    })

    try {
      await this.connection.start()
      this.isConnected = true
      console.log('[SignalR] Connected successfully')
      this.handlers.onConnected?.()
    } catch (error) {
      console.error('[SignalR] Connection failed', error)
      throw error
    }
  }

  async stop(): Promise<void> {
    if (this.connection) {
      await this.connection.stop()
      this.isConnected = false
      console.log('[SignalR] Stopped')
    }
  }

  getConnectionStatus(): boolean {
    return this.isConnected
  }
}

export const signalRClient = new SignalRClient()