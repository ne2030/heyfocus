import { invoke } from '@tauri-apps/api/core'
import type { AppData, TaskStatus } from '../types'

export const tauriApi = {
  loadData: () => invoke<AppData>('load_data'),

  addTask: (text: string, status: TaskStatus) =>
    invoke<AppData>('add_task', { text, status }),

  moveTask: (id: number, newStatus: TaskStatus) =>
    invoke<AppData>('move_task', { id, newStatus }),

  setFocus: (id: number) => invoke<AppData>('set_focus', { id }),

  clearFocus: () => invoke<AppData>('clear_focus'),

  completeTask: (id: number) => invoke<AppData>('complete_task', { id }),

  deleteTask: (id: number) => invoke<AppData>('delete_task', { id }),

  editTask: (id: number, text: string) =>
    invoke<AppData>('edit_task', { id, text }),

  undoAction: () => invoke<AppData>('undo_action'),

  clearLogs: () => invoke<AppData>('clear_logs'),

  toggleAlwaysOnTop: (enabled: boolean) =>
    invoke<void>('toggle_always_on_top', { enabled }),

  setWindowSize: (width: number, height: number) =>
    invoke<void>('set_window_size', { width, height }),

  openLogWindow: () => invoke<void>('open_log_window'),

  openStatsWindow: () => invoke<void>('open_stats_window'),
}
