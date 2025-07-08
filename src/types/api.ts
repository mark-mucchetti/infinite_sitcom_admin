export interface Show {
  id: string
  name: string
  year: number
  format: string
  content_rating: string
  class_setting: string
  geographic_setting: string
  theme: string
  created_at?: string
  updated_at?: string
}

export interface Episode {
  id: string
  show_id: string
  season_number: number
  episode_number: number
  title: string
  air_date: string | null
  logline: string
  a_plot: string
  b_plot: string
  c_plot?: string
  theme: string
  director?: string | null
  writer?: string | null
  assets_folder: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  script_generated: string | boolean // Backend returns "true"/"false" strings
  assets_generated: string | boolean // Backend returns "true"/"false" strings  
  created_at?: string
  updated_at?: string
}

export interface Character {
  id: string
  show_id: string
  character_name: string
  role_type: 'lead' | 'regular' | 'recurring'
  archetype: string
  age_range: string
  character_relationship: string
  catchphrases?: string
  description: string
  physical_description: string
  eleven_voice_id?: string
  created_at: string
}

export interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  total_pages: number
}

// Backend API response format
export interface BackendPaginatedResponse<T> {
  [key: string]: T[] | number // e.g., "shows": [...], "episodes": [...]
  total: number
  limit: number
  offset: number
}

export interface GenerationProgress {
  phase: string
  status: 'pending' | 'in_progress' | 'completed' | 'failed'
  progress: number
  message?: string
}