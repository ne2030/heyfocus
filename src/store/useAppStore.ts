import { create } from 'zustand'
import { tauriApi } from '../lib/tauri'
import { broadcastDataUpdate, broadcastOpacity } from '../lib/broadcast'
import type { AppData, Task, LogEntry, TaskStatus } from '../types'

const OPACITY_KEY = 'heyfocus_opacity'

// Toast timeout management
let toastTimeoutId: number | null = null

type ToastType = 'success' | 'error' | 'focus' | 'delete'

interface ToastState {
  message: string
  type: ToastType
  visible: boolean
}

interface AppState {
  // Data state (from backend)
  tasks: Task[]
  logs: LogEntry[]
  nextId: number

  // UI state
  isAlwaysOnTop: boolean
  isCompactMode: boolean
  selectedTaskId: number | null
  editingTaskId: number | null
  draggedTaskId: number | null
  isLogOverlayVisible: boolean
  isLaterExpanded: boolean
  opacity: number
  toast: ToastState

  // Computed getters
  activeTasks: () => Task[]
  laterTasks: () => Task[]
  focusedTask: () => Task | undefined

  // Data actions
  loadData: () => Promise<void>
  addTask: (text: string) => Promise<void>
  moveTask: (id: number, newStatus: TaskStatus) => Promise<void>
  setFocus: (id: number) => Promise<void>
  clearFocus: () => Promise<void>
  completeTask: (id: number) => Promise<void>
  deleteTask: (id: number) => Promise<void>
  editTask: (id: number, text: string) => Promise<void>
  undoAction: () => Promise<void>
  clearLogs: () => Promise<void>

  // UI actions
  setAlwaysOnTop: (enabled: boolean) => Promise<void>
  toggleCompactMode: () => void
  setSelectedTask: (id: number | null) => void
  setEditingTask: (id: number | null) => void
  setDraggedTask: (id: number | null) => void
  toggleLogOverlay: () => void
  toggleLaterSection: () => void
  setOpacity: (value: number) => void
  showToast: (message: string, type?: ToastType) => void
  hideToast: () => void

  // Sync state from external source
  syncState: (data: AppData) => void
}

export const useAppStore = create<AppState>((set, get) => ({
  // Initial state
  tasks: [],
  logs: [],
  nextId: 0,
  isAlwaysOnTop: false,
  isCompactMode: false,
  selectedTaskId: null,
  editingTaskId: null,
  draggedTaskId: null,
  isLogOverlayVisible: false,
  isLaterExpanded: false,
  opacity: parseInt(localStorage.getItem(OPACITY_KEY) || '100'),
  toast: { message: '', type: 'success' as ToastType, visible: false },

  // Computed getters
  activeTasks: () => get().tasks.filter((t) => t.status === 'active'),
  laterTasks: () => get().tasks.filter((t) => t.status === 'later'),
  focusedTask: () => get().tasks.find((t) => t.isFocus),

  // Data actions
  loadData: async () => {
    try {
      const data = await tauriApi.loadData()
      set({
        tasks: data.tasks,
        logs: data.logs,
        nextId: data.next_id,
      })
    } catch (error) {
      console.error('Failed to load data:', error)
      get().showToast('Failed to load data', 'error')
    }
  },

  addTask: async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed) return

    const { activeTasks } = get()
    const status: TaskStatus = activeTasks().length < 5 ? 'active' : 'later'

    try {
      const data = await tauriApi.addTask(trimmed, status)
      set({
        tasks: data.tasks,
        logs: data.logs,
        nextId: data.next_id,
      })
      broadcastDataUpdate()

      if (status === 'later') {
        get().showToast('Added to Later')
      }
    } catch (error) {
      console.error('Failed to add task:', error)
      get().showToast(String(error), 'error')
    }
  },

  moveTask: async (id: number, newStatus: TaskStatus) => {
    try {
      const data = await tauriApi.moveTask(id, newStatus)
      set({
        tasks: data.tasks,
        logs: data.logs,
        nextId: data.next_id,
        selectedTaskId: null,
      })
      broadcastDataUpdate()
    } catch (error) {
      console.error('Failed to move task:', error)
      get().showToast(String(error), 'error')
    }
  },

  setFocus: async (id: number) => {
    try {
      const task = get().tasks.find((t) => t.id === id)
      const data = await tauriApi.setFocus(id)
      set({
        tasks: data.tasks,
        logs: data.logs,
        nextId: data.next_id,
      })
      broadcastDataUpdate()
      if (task) {
        const truncated = task.text.length > 20 ? task.text.slice(0, 20) + '…' : task.text
        get().showToast(`Focus: ${truncated}`, 'focus')
      }
    } catch (error) {
      console.error('Failed to set focus:', error)
      get().showToast(String(error), 'error')
    }
  },

  clearFocus: async () => {
    try {
      const data = await tauriApi.clearFocus()
      set({
        tasks: data.tasks,
        logs: data.logs,
        nextId: data.next_id,
      })
      broadcastDataUpdate()
    } catch (error) {
      console.error('Failed to clear focus:', error)
      get().showToast(String(error), 'error')
    }
  },

  completeTask: async (id: number) => {
    try {
      const data = await tauriApi.completeTask(id)
      const { selectedTaskId } = get()
      set({
        tasks: data.tasks,
        logs: data.logs,
        nextId: data.next_id,
        selectedTaskId: selectedTaskId === id ? null : selectedTaskId,
      })
      broadcastDataUpdate()
      get().showToast('Task completed!')
    } catch (error) {
      console.error('Failed to complete task:', error)
      get().showToast(String(error), 'error')
    }
  },

  deleteTask: async (id: number) => {
    try {
      const data = await tauriApi.deleteTask(id)
      const { selectedTaskId } = get()
      set({
        tasks: data.tasks,
        logs: data.logs,
        nextId: data.next_id,
        selectedTaskId: selectedTaskId === id ? null : selectedTaskId,
      })
      broadcastDataUpdate()
      get().showToast('Task deleted', 'delete')
    } catch (error) {
      console.error('Failed to delete task:', error)
      get().showToast(String(error), 'error')
    }
  },

  editTask: async (id: number, text: string) => {
    const trimmed = text.trim()
    if (!trimmed) return

    try {
      const data = await tauriApi.editTask(id, trimmed)
      set({
        tasks: data.tasks,
        logs: data.logs,
        nextId: data.next_id,
        editingTaskId: null,
      })
      broadcastDataUpdate()
    } catch (error) {
      console.error('Failed to edit task:', error)
      get().showToast(String(error), 'error')
    }
  },

  undoAction: async () => {
    try {
      const data = await tauriApi.undoAction()
      set({
        tasks: data.tasks,
        logs: data.logs,
        nextId: data.next_id,
      })
      broadcastDataUpdate()
      get().showToast('Undo successful')
    } catch (error) {
      console.error('Failed to undo:', error)
      get().showToast(String(error), 'error')
    }
  },

  clearLogs: async () => {
    try {
      const data = await tauriApi.clearLogs()
      set({
        tasks: data.tasks,
        logs: data.logs,
        nextId: data.next_id,
      })
      broadcastDataUpdate()
    } catch (error) {
      console.error('Failed to clear logs:', error)
      get().showToast(String(error), 'error')
    }
  },

  // UI actions
  setAlwaysOnTop: async (enabled: boolean) => {
    try {
      await tauriApi.toggleAlwaysOnTop(enabled)
      set({ isAlwaysOnTop: enabled })
    } catch (error) {
      console.error('Failed to toggle always on top:', error)
    }
  },

  toggleCompactMode: () => {
    set((state) => ({ isCompactMode: !state.isCompactMode }))
  },

  setSelectedTask: (id: number | null) => {
    set({ selectedTaskId: id })
  },

  setEditingTask: (id: number | null) => {
    set({ editingTaskId: id })
  },

  setDraggedTask: (id: number | null) => {
    set({ draggedTaskId: id })
  },

  toggleLogOverlay: () => {
    set((state) => ({ isLogOverlayVisible: !state.isLogOverlayVisible }))
  },

  toggleLaterSection: () => {
    set((state) => ({ isLaterExpanded: !state.isLaterExpanded }))
  },

  setOpacity: (value: number) => {
    const clamped = Math.max(30, Math.min(100, value))
    localStorage.setItem(OPACITY_KEY, String(clamped))
    document.documentElement.style.setProperty('--bg-alpha', String(clamped / 100))
    set({ opacity: clamped })
    broadcastOpacity(clamped)
  },

  showToast: (message: string, type: ToastType = 'success') => {
    // Clear existing timer
    if (toastTimeoutId) {
      clearTimeout(toastTimeoutId)
    }

    set({ toast: { message, type, visible: true } })

    toastTimeoutId = window.setTimeout(() => {
      get().hideToast()
      toastTimeoutId = null
    }, 2000)
  },

  hideToast: () => {
    // Only set visible to false, keep type to prevent color flash
    set((state) => ({ toast: { ...state.toast, visible: false } }))
  },

  syncState: (data: AppData) => {
    set({
      tasks: data.tasks,
      logs: data.logs,
      nextId: data.next_id,
    })
  },
}))
