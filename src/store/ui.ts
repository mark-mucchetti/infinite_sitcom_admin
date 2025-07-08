import { create } from 'zustand'

interface Toast {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
}

interface UIState {
  toasts: Toast[]
  showToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
  clearToasts: () => void
}

export const useUIStore = create<UIState>((set) => ({
  toasts: [],
  
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
  }
}))