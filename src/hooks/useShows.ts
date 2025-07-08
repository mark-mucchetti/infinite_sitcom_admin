import { useState, useEffect } from 'react'
import { showsApi, ShowListParams } from '@/services/shows'
import { Show, PaginatedResponse } from '@/types/api'

interface UseShowsResult {
  shows: Show[]
  loading: boolean
  error: string | null
  total: number
  page: number
  totalPages: number
  refetch: () => void
  setParams: (params: ShowListParams) => void
}

export function useShows(initialParams?: ShowListParams): UseShowsResult {
  const [shows, setShows] = useState<Show[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [params, setParams] = useState<ShowListParams>(initialParams || { page: 1, limit: 10 })

  const fetchShows = async () => {
    try {
      setLoading(true)
      setError(null)
      const response: PaginatedResponse<Show> = await showsApi.list(params)
      setShows(response.data)
      setTotal(response.total)
      setPage(response.page)
      setTotalPages(response.total_pages)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch shows')
      setShows([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchShows()
  }, [params.page, params.limit, params.search, params.format, params.year])

  const refetch = () => {
    fetchShows()
  }

  const updateParams = (newParams: ShowListParams) => {
    setParams(prev => ({ ...prev, ...newParams }))
  }

  return {
    shows,
    loading,
    error,
    total,
    page,
    totalPages,
    refetch,
    setParams: updateParams
  }
}

export function useShow(id: string) {
  const [show, setShow] = useState<Show | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchShow = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await showsApi.get(id)
      setShow(response.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch show')
      setShow(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (id) {
      fetchShow()
    }
  }, [id])

  const refetch = () => {
    if (id) {
      fetchShow()
    }
  }

  return {
    show,
    loading,
    error,
    refetch
  }
}