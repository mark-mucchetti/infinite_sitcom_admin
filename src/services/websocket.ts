import { io, Socket } from 'socket.io-client'

export type ProgressEvent = {
  type: 'progress'
  episodeId: string
  phase: string
  progress: number
  message?: string
}

export type StatusEvent = {
  type: 'status'
  episodeId: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
}

export type WebSocketEvent = ProgressEvent | StatusEvent

class WebSocketClient {
  private socket: Socket | null = null
  private url: string
  private listeners: Map<string, Set<(event: WebSocketEvent) => void>> = new Map()

  constructor(url?: string) {
    this.url = url || import.meta.env.VITE_WS_URL || 'http://localhost:8055'
  }

  connect() {
    if (this.socket?.connected) {
      return
    }

    this.socket = io(this.url, {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    })

    this.socket.on('connect', () => {
      console.log('WebSocket connected')
    })

    this.socket.on('disconnect', () => {
      console.log('WebSocket disconnected')
    })

    this.socket.on('progress', (data: ProgressEvent) => {
      this.notifyListeners('progress', data)
    })

    this.socket.on('status', (data: StatusEvent) => {
      this.notifyListeners('status', data)
    })

    this.socket.on('error', (error: any) => {
      console.error('WebSocket error:', error)
    })
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
  }

  subscribe(eventType: string, callback: (event: WebSocketEvent) => void) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set())
    }
    this.listeners.get(eventType)!.add(callback)

    // Auto-connect if not connected
    if (!this.socket?.connected) {
      this.connect()
    }

    // Return unsubscribe function
    return () => {
      const callbacks = this.listeners.get(eventType)
      if (callbacks) {
        callbacks.delete(callback)
        if (callbacks.size === 0) {
          this.listeners.delete(eventType)
        }
      }
    }
  }

  private notifyListeners(eventType: string, event: WebSocketEvent) {
    const callbacks = this.listeners.get(eventType)
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(event)
        } catch (error) {
          console.error('Error in WebSocket listener:', error)
        }
      })
    }
  }

  // Join room for episode-specific updates
  joinEpisodeRoom(episodeId: string) {
    if (this.socket?.connected) {
      this.socket.emit('join_episode', { episodeId })
    }
  }

  // Leave episode room
  leaveEpisodeRoom(episodeId: string) {
    if (this.socket?.connected) {
      this.socket.emit('leave_episode', { episodeId })
    }
  }

  get isConnected() {
    return this.socket?.connected || false
  }
}

// Export singleton instance
export const wsClient = new WebSocketClient()
export default wsClient