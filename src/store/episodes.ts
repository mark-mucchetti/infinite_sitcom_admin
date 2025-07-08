import { create } from 'zustand'
import { Episode } from '@/types/api'

interface EpisodesState {
  episodes: Episode[]
  selectedEpisode: Episode | null
  loading: boolean
  error: string | null
  total: number
  page: number
  totalPages: number
  filters: {
    showId?: string
    status?: string
    search?: string
    season?: number
  }
  
  // Actions
  setEpisodes: (episodes: Episode[], total: number, page: number, totalPages: number) => void
  setSelectedEpisode: (episode: Episode | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setFilters: (filters: Partial<EpisodesState['filters']>) => void
  addEpisode: (episode: Episode) => void
  updateEpisode: (id: string, updates: Partial<Episode>) => void
  removeEpisode: (id: string) => void
  clearEpisodes: () => void
}

export const useEpisodesStore = create<EpisodesState>((set, get) => ({
  episodes: [],
  selectedEpisode: null,
  loading: false,
  error: null,
  total: 0,
  page: 1,
  totalPages: 0,
  filters: {},

  setEpisodes: (episodes, total, page, totalPages) => {
    set({ episodes, total, page, totalPages, error: null })
  },

  setSelectedEpisode: (episode) => {
    set({ selectedEpisode: episode })
  },

  setLoading: (loading) => {
    set({ loading })
  },

  setError: (error) => {
    set({ error, loading: false })
  },

  setFilters: (newFilters) => {
    const { filters } = get()
    set({ 
      filters: { ...filters, ...newFilters },
      page: 1 // Reset to first page when filters change
    })
  },

  addEpisode: (episode) => {
    const { episodes, total } = get()
    set({ 
      episodes: [episode, ...episodes],
      total: total + 1
    })
  },

  updateEpisode: (id, updates) => {
    const { episodes, selectedEpisode } = get()
    const updatedEpisodes = episodes.map(episode => 
      episode.id === id ? { ...episode, ...updates } : episode
    )
    set({ 
      episodes: updatedEpisodes,
      selectedEpisode: selectedEpisode?.id === id ? { ...selectedEpisode, ...updates } : selectedEpisode
    })
  },

  removeEpisode: (id) => {
    const { episodes, selectedEpisode, total } = get()
    set({
      episodes: episodes.filter(episode => episode.id !== id),
      selectedEpisode: selectedEpisode?.id === id ? null : selectedEpisode,
      total: Math.max(0, total - 1)
    })
  },

  clearEpisodes: () => {
    set({
      episodes: [],
      selectedEpisode: null,
      total: 0,
      page: 1,
      totalPages: 0,
      filters: {},
      error: null
    })
  }
}))