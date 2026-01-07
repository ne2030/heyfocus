export type TaskStatus = 'active' | 'later'

export interface Task {
  id: number
  text: string
  status: TaskStatus
  isFocus: boolean
}

export type LogEventType =
  | 'TASK_CREATED'
  | 'TASK_DONE'
  | 'TASK_DELETED'
  | 'TASK_EDITED'
  | 'MOVE_TO_ACTIVE'
  | 'MOVE_TO_LATER'
  | 'SWITCH_FOCUS'
  | 'CLEAR_FOCUS'

export interface LogEntry {
  time: string
  event: LogEventType
  task: string
  task_id?: number
  prev_status?: string
  prev_text?: string
  prev_focus?: boolean
  prev_focus_id?: number
}

export interface StateSnapshot {
  log_index: number
  tasks: Task[]
  next_id: number
}

export interface AppData {
  tasks: Task[]
  logs: LogEntry[]
  next_id: number
  snapshots?: StateSnapshot[]
}
