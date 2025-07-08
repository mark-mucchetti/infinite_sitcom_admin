import { create } from 'zustand'
import { Show } from '@/types/api'

interface ShowsState {
  shows: Show[]
  selectedShow: Show | null
  loading: boolean
  error: string | null
  total: number
  page: number
  totalPages: number
  searchTerm: string
  
  // Actions
  setShows: (shows: Show[], total: number, page: number, totalPages: number) => void
  setSelectedShow: (show: Show | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setSearchTerm: (searchTerm: string) => void
  addShow: (show: Show) => void
  updateShow: (id: string, updates: Partial<Show>) => void
  removeShow: (id: string) => void
  clearShows: () => void
}

export const useShowsStore = create<ShowsState>((set, get) => ({
  shows: [],
  selectedShow: null,
  loading: false,
  error: null,
  total: 0,
  page: 1,
  totalPages: 0,
  searchTerm: '',

  setShows: (shows, total, page, totalPages) => {
    set({ shows, total, page, totalPages, error: null })
  },

  setSelectedShow: (show) => {
    set({ selectedShow: show })
  },

  setLoading: (loading) => {
    set({ loading })
  },

  setError: (error) => {
    set({ error, loading: false })
  },

  setSearchTerm: (searchTerm) => {
    set({ searchTerm })
  },

  addShow: (show) => {
    const { shows, total } = get()
    set({ 
      shows: [show, ...shows],
      total: total + 1
    })
  },

  updateShow: (id, updates) => {
    const { shows, selectedShow } = get()
    const updatedShows = shows.map(show => 
      show.id === id ? { ...show, ...updates } : show
    )
    set({ 
      shows: updatedShows,
      selectedShow: selectedShow?.id === id ? { ...selectedShow, ...updates } : selectedShow
    })
  },

  removeShow: (id) => {
    const { shows, selectedShow, total } = get()
    set({
      shows: shows.filter(show => show.id !== id),
      selectedShow: selectedShow?.id === id ? null : selectedShow,
      total: Math.max(0, total - 1)
    })
  },

  clearShows: () => {
    set({
      shows: [],
      selectedShow: null,
      total: 0,
      page: 1,
      totalPages: 0,
      searchTerm: '',
      error: null
    })
  }
}))