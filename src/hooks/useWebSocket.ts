import { useEffect, useCallback } from 'react'
import { wsClient, WebSocketEvent, ProgressEvent, StatusEvent } from '@/services/websocket'
import { useProgressStore } from '@/store/ui'
import { useEpisodesStore } from '@/store/episodes'

interface UseWebSocketOptions {
  episodeId?: string
  onProgress?: (event: ProgressEvent) => void
  onStatus?: (event: StatusEvent) => void
  autoConnect?: boolean
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const {
    episodeId,
    onProgress,
    onStatus,
    autoConnect = true
  } = options

  const { setProgress } = useProgressStore()
  const { updateEpisode } = useEpisodesStore()

  const handleProgress = useCallback((event: WebSocketEvent) => {
    if (event.type === 'progress') {
      const progressEvent = event as ProgressEvent
      
      // Update global progress store
      setProgress({
        phase: progressEvent.phase,
        progress: progressEvent.progress,
        status: 'in_progress',
        message: progressEvent.message
      })

      // Call custom handler if provided
      onProgress?.(progressEvent)
    }
  }, [setProgress, onProgress])

  const handleStatus = useCallback((event: WebSocketEvent) => {
    if (event.type === 'status') {
      const statusEvent = event as StatusEvent
      
      // Update episode in store
      updateEpisode(statusEvent.episodeId, {
        status: statusEvent.status
      })

      // Call custom handler if provided
      onStatus?.(statusEvent)
    }
  }, [updateEpisode, onStatus])

  useEffect(() => {
    if (!autoConnect) return

    // Subscribe to WebSocket events
    const unsubscribeProgress = wsClient.subscribe('progress', handleProgress)
    const unsubscribeStatus = wsClient.subscribe('status', handleStatus)

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
  }, [episodeId, handleProgress, handleStatus, autoConnect])

  return {
    isConnected: wsClient.isConnected,
    connect: () => wsClient.connect(),
    disconnect: () => wsClient.disconnect(),
    joinEpisodeRoom: (id: string) => wsClient.joinEpisodeRoom(id),
    leaveEpisodeRoom: (id: string) => wsClient.leaveEpisodeRoom(id)
  }
}

// Hook for episode-specific progress tracking
export function useEpisodeProgress(episodeId: string) {
  const { progress, isGenerating } = useProgressStore()

  useWebSocket({
    episodeId,
    onProgress: (event) => {
      console.log(`Episode ${episodeId} progress:`, event)
    },
    onStatus: (event) => {
      console.log(`Episode ${episodeId} status:`, event.status)
    }
  })

  return {
    progress,
    isGenerating,
    phase: progress.phase,
    percentage: progress.progress,
    status: progress.status,
    message: progress.message
  }
}