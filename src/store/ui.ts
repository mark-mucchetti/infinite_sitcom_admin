import { create } from 'zustand'

interface Toast {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
}

interface Progress {
  phase: string
  progress: number
  status: 'pending' | 'in_progress' | 'completed' | 'failed'
  message?: string
}

interface UIState {
  toasts: Toast[]
  showToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
  clearToasts: () => void
  progress: Progress
  isGenerating: boolean
  setProgress: (progress: Progress) => void
  setGenerating: (generating: boolean) => void
}

export const useUIStore = create<UIState>((set) => ({
  toasts: [],
  progress: {
    phase: '',
    progress: 0,
    status: 'pending'
  },
  isGenerating: false,
  
  showToast: (toast) => {
    const id = Math.random().toString(36).substring(7)
    const newToast: Toast = { ...toast, id }
    
    set((state) => ({
      toasts: [...state.toasts, newToast]
    }))

    // Auto-remove toast after duration (default 5 seconds)
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter(t => t.id !== id)
      }))
    }, toast.duration || 5000)
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter(t => t.id !== id)
    }))
  },

  clearToasts: () => {
    set({ toasts: [] })
  },

  setProgress: (progress) => {
    set({ progress })
  },

  setGenerating: (generating) => {
    set({ isGenerating: generating })
  }
}))

// Convenience hook for progress tracking
export const useProgressStore = () => {
  const { progress, isGenerating, setProgress, setGenerating } = useUIStore()
  return { progress, isGenerating, setProgress, setGenerating }
}