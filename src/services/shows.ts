import { apiClient } from './api'
import { Show, ApiResponse, PaginatedResponse } from '@/types/api'

export interface ShowListParams {
  page?: number
  limit?: number
  search?: string
  format?: string
  year?: number
}

export interface CreateShowRequest {
  prompt: string
}

export interface UpdateShowRequest {
  name?: string
  year?: number
  format?: string
  content_rating?: string
  class_setting?: string
  geographic_setting?: string
  theme?: string
}

export const showsApi = {
  // List shows with filtering and pagination
  list: async (params?: ShowListParams): Promise<PaginatedResponse<Show>> => {
    const response: any = await apiClient.get('/shows', params)
    
    // Transform backend response to frontend format
    return {
      data: response.shows || [],
      total: response.total || 0,
      page: params?.page || 1,
      limit: response.limit || 10,
      total_pages: Math.ceil((response.total || 0) / (response.limit || 10))
    }
  },

  // Get single show by ID
  get: (id: string): Promise<ApiResponse<Show>> =>
    apiClient.get(`/shows/${id}`),

  // Create show using AI generation
  generateAI: (data: CreateShowRequest): Promise<ApiResponse<Show>> =>
    apiClient.post('/shows/generate', data),

  // Update show details
  update: (id: string, data: UpdateShowRequest): Promise<ApiResponse<Show>> =>
    apiClient.patch(`/shows/${id}`, data),

  // Delete show (cascades to episodes and assets)
  delete: (id: string): Promise<ApiResponse<void>> =>
    apiClient.delete(`/shows/${id}`),

  // Get show characters
  getCharacters: (id: string) =>
    apiClient.get(`/shows/${id}/characters`),

  // Get show assets
  getAssets: (id: string) =>
    apiClient.get(`/shows/${id}/assets`),
}