import { apiClient } from './api'
import { Episode, ApiResponse, PaginatedResponse } from '@/types/api'

export interface EpisodeListParams {
  show_id?: string
  page?: number
  limit?: number
  search?: string
  status?: string
  season?: number
}

export interface CreateEpisodeRequest {
  show_id: string
  season_number: number
  episode_number: number
  title: string
  logline: string
  a_plot: string
  b_plot: string
  c_plot?: string
  theme: string
}

export interface CreateEpisodeAIRequest {
  prompt: string
  season_finale?: boolean
}

export interface UpdateEpisodeRequest {
  title?: string
  logline?: string
  a_plot?: string
  b_plot?: string
  c_plot?: string
  theme?: string
  writer?: string
  director?: string
}

export const episodesApi = {
  // List episodes with filtering and pagination
  list: async (params?: EpisodeListParams): Promise<PaginatedResponse<Episode>> => {
    const response: any = await apiClient.get('/episodes', params)
    
    // Transform backend response to frontend format
    return {
      data: response.episodes || [],
      total: response.total || 0,
      page: params?.page || 1,
      limit: response.limit || 10,
      total_pages: Math.ceil((response.total || 0) / (response.limit || 10))
    }
  },

  // Get single episode by ID
  get: async (id: string): Promise<ApiResponse<Episode>> => {
    const response = await apiClient.get(`/episodes/${id}`)
    return {
      data: response,
      success: true
    }
  },

  // Create episode manually
  create: (data: CreateEpisodeRequest): Promise<ApiResponse<Episode>> =>
    apiClient.post('/episodes', data),

  // Create episode using AI generation
  generateAI: (showId: string, data: CreateEpisodeAIRequest): Promise<ApiResponse<Episode>> =>
    apiClient.post(`/episodes/generate?show_id=${showId}`, data),

  // Update episode details
  update: (id: string, data: UpdateEpisodeRequest): Promise<ApiResponse<Episode>> =>
    apiClient.patch(`/episodes/${id}`, data),

  // Delete episode and assets
  delete: (id: string): Promise<ApiResponse<void>> =>
    apiClient.delete(`/episodes/${id}`),

  // Script generation endpoints
  generateScript: async (id: string): Promise<ApiResponse<any>> => {
    const response = await apiClient.post(`/episodes/${id}/generate-script`)
    return { data: response, success: true }
  },

  generateBeatSheet: async (id: string, prompt?: string): Promise<ApiResponse<any>> => {
    const response = await apiClient.post(`/episodes/${id}/generate-beat-sheet`, prompt ? { prompt } : {})
    return { data: response, success: true }
  },

  generateScenes: async (id: string): Promise<ApiResponse<any>> => {
    const response = await apiClient.post(`/episodes/${id}/generate-all-scenes`)
    return { data: response, success: true }
  },

  editorialPass: async (id: string): Promise<ApiResponse<any>> => {
    const response = await apiClient.post(`/episodes/${id}/editorial-pass`)
    return { data: response, success: true }
  },

  generateTeleplay: async (id: string): Promise<ApiResponse<any>> => {
    const response = await apiClient.post(`/episodes/${id}/generate-teleplay`)
    return { data: response, success: true }
  },

  // Audio generation endpoints
  generateAudio: async (id: string): Promise<ApiResponse<any>> => {
    const response = await apiClient.post(`/episodes/${id}/generate-full-audio`)
    return { data: response, success: true }
  },

  generateAudioManifest: async (id: string): Promise<ApiResponse<any>> => {
    const response = await apiClient.post(`/episodes/${id}/generate-audio-manifest`)
    return { data: response, success: true }
  },

  generateAudioFiles: async (id: string): Promise<ApiResponse<any>> => {
    const response = await apiClient.post(`/episodes/${id}/generate-audio-files`)
    return { data: response, success: true }
  },

  assembleEpisode: async (id: string): Promise<ApiResponse<any>> => {
    const response = await apiClient.post(`/episodes/${id}/assemble-episode`)
    return { data: response, success: true }
  },

  // Status and audit
  audit: (id: string) =>
    apiClient.post(`/episodes/${id}/audit`),

  reset: (id: string): Promise<ApiResponse<void>> =>
    apiClient.post(`/episodes/${id}/reset`),
}