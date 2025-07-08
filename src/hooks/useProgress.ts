import { useState, useEffect } from 'react'
import { wsClient, WebSocketEvent } from '@/services/websocket'

interface ProgressState {
  [episodeId: string]: {
    phase: string
    progress: number
    status: 'pending' | 'processing' | 'completed' | 'failed'
    message?: string
  }
}

export function useProgress(episodeId?: string) {
  const [progressState, setProgressState] = useState<ProgressState>({})

  useEffect(() => {
    const unsubscribeProgress = wsClient.subscribe('progress', (event: WebSocketEvent) => {
      if (event.type === 'progress' && (!episodeId || event.episodeId === episodeId)) {
        setProgressState(prev => ({
          ...prev,
          [event.episodeId]: {
            ...prev[event.episodeId],
            phase: event.phase,
            progress: event.progress,
            message: event.message,
            status: 'processing'
          }
        }))
      }
    })

    const unsubscribeStatus = wsClient.subscribe('status', (event: WebSocketEvent) => {
      if (event.type === 'status' && (!episodeId || event.episodeId === episodeId)) {
        setProgressState(prev => ({
          ...prev,
          [event.episodeId]: {
            ...prev[event.episodeId],
            status: event.status
          }
        }))
      }
    })

    // Join episode room if episodeId provided
    if (episodeId) {
      wsClient.joinEpisodeRoom(episodeId)
    }

    return () => {
      unsubscribeProgress()
      unsubscribeStatus()
      
      if (episodeId) {
        wsClient.leaveEpisodeRoom(episodeId)
      }
    }
  }, [episodeId])

  const getProgress = (id: string) => progressState[id]
  const getAllProgress = () => progressState

  return {
    getProgress,
    getAllProgress,
    isConnected: wsClient.isConnected
  }
}