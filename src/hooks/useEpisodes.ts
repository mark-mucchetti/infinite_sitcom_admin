import { useState, useEffect } from 'react'
import { episodesApi, EpisodeListParams } from '@/services/episodes'
import { Episode, PaginatedResponse } from '@/types/api'

interface UseEpisodesResult {
  episodes: Episode[]
  loading: boolean
  error: string | null
  total: number
  page: number
  totalPages: number
  refetch: () => void
  setParams: (params: EpisodeListParams) => void
}

export function useEpisodes(initialParams?: EpisodeListParams): UseEpisodesResult {
  const [episodes, setEpisodes] = useState<Episode[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [params, setParams] = useState<EpisodeListParams>(initialParams || { page: 1, limit: 10 })

  const fetchEpisodes = async () => {
    try {
      setLoading(true)
      setError(null)
      const response: PaginatedResponse<Episode> = await episodesApi.list(params)
      setEpisodes(response.data)
      setTotal(response.total)
      setPage(response.page)
      setTotalPages(response.total_pages)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch episodes')
      setEpisodes([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    console.log('useEpisodes: fetching with params:', params)
    fetchEpisodes()
  }, [params.page, params.limit, params.search, params.show_id, params.status, params.season])

  const refetch = () => {
    fetchEpisodes()
  }

  const updateParams = (newParams: EpisodeListParams) => {
    setParams(prev => ({ ...prev, ...newParams }))
  }

  return {
    episodes,
    loading,
    error,
    total,
    page,
    totalPages,
    refetch,
    setParams: updateParams
  }
}

export function useEpisode(id: string) {
  const [episode, setEpisode] = useState<Episode | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchEpisode = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await episodesApi.get(id)
      setEpisode(response.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch episode')
      setEpisode(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (id) {
      fetchEpisode()
    }
  }, [id])

  const refetch = () => {
    if (id) {
      fetchEpisode()
    }
  }

  return {
    episode,
    loading,
    error,
    refetch
  }
}