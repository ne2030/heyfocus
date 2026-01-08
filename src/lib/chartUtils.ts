import type { LogEntry } from '../types'

export interface FocusSession {
  taskId: number
  taskName: string
  startTime: Date
  endTime: Date
  durationMinutes: number
}

export interface TaskFocusTime {
  taskId: number
  taskName: string
  totalMinutes: number
  color: string
}

export interface HourlyActivity {
  hour: number
  count: number
  doneCount: number
  focusCount: number
}

export interface SwitchData {
  hour: number
  count: number
}

export interface SlotSnapshot {
  time: Date
  activeCount: number
}

export interface SlotData {
  currentActive: number
  snapshots: SlotSnapshot[]
}

export interface DailyStats {
  cleared: number          // done + deleted (mental threads closed)
  switches: number         // focus switches (lower = better)
  totalFocusMinutes: number
  avgFocusMinutes: number
  longestFocusMinutes: number
  score: number            // focus-based score
}

const CHART_COLORS = [
  '#f97316', // orange (primary)
  '#3b82f6', // blue
  '#10b981', // emerald
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#f59e0b', // amber
  '#6366f1', // indigo
]

export function parseTime(timeStr: string): Date {
  return new Date(timeStr)
}

export function calculateFocusSessions(logs: LogEntry[]): FocusSession[] {
  const sessions: FocusSession[] = []
  const sortedLogs = [...logs].sort((a, b) =>
    parseTime(a.time).getTime() - parseTime(b.time).getTime()
  )

  let currentFocus: { taskId: number; taskName: string; startTime: Date } | null = null

  for (const log of sortedLogs) {
    if (log.event === 'SWITCH_FOCUS' && log.task_id) {
      // End previous session if exists
      if (currentFocus) {
        const endTime = parseTime(log.time)
        const duration = (endTime.getTime() - currentFocus.startTime.getTime()) / 60000
        if (duration > 0) {
          sessions.push({
            taskId: currentFocus.taskId,
            taskName: currentFocus.taskName,
            startTime: currentFocus.startTime,
            endTime,
            durationMinutes: duration,
          })
        }
      }
      // Start new session
      currentFocus = {
        taskId: log.task_id,
        taskName: log.task,
        startTime: parseTime(log.time),
      }
    } else if (log.event === 'CLEAR_FOCUS' || log.event === 'TASK_DONE' || log.event === 'TASK_DELETED') {
      // End current session
      if (currentFocus) {
        const endTime = parseTime(log.time)
        const duration = (endTime.getTime() - currentFocus.startTime.getTime()) / 60000
        if (duration > 0) {
          sessions.push({
            taskId: currentFocus.taskId,
            taskName: currentFocus.taskName,
            startTime: currentFocus.startTime,
            endTime,
            durationMinutes: duration,
          })
        }
        currentFocus = null
      }
    }
  }

  // If still focused, end at current time
  if (currentFocus) {
    const endTime = new Date()
    const duration = (endTime.getTime() - currentFocus.startTime.getTime()) / 60000
    if (duration > 0) {
      sessions.push({
        taskId: currentFocus.taskId,
        taskName: currentFocus.taskName,
        startTime: currentFocus.startTime,
        endTime,
        durationMinutes: duration,
      })
    }
  }

  return sessions
}

export function calculateTaskFocusTimes(sessions: FocusSession[]): TaskFocusTime[] {
  const taskMap = new Map<number, { name: string; total: number }>()

  for (const session of sessions) {
    const existing = taskMap.get(session.taskId)
    if (existing) {
      existing.total += session.durationMinutes
    } else {
      taskMap.set(session.taskId, {
        name: session.taskName,
        total: session.durationMinutes,
      })
    }
  }

  const results: TaskFocusTime[] = []
  let colorIndex = 0

  taskMap.forEach((value, key) => {
    results.push({
      taskId: key,
      taskName: value.name,
      totalMinutes: value.total,
      color: CHART_COLORS[colorIndex % CHART_COLORS.length],
    })
    colorIndex++
  })

  return results.sort((a, b) => b.totalMinutes - a.totalMinutes)
}

export function calculateHourlyActivity(logs: LogEntry[]): HourlyActivity[] {
  const hours: HourlyActivity[] = Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    count: 0,
    doneCount: 0,
    focusCount: 0,
  }))

  for (const log of logs) {
    const hour = parseTime(log.time).getHours()
    hours[hour].count++
    if (log.event === 'TASK_DONE') {
      hours[hour].doneCount++
    }
    if (log.event === 'SWITCH_FOCUS') {
      hours[hour].focusCount++
    }
  }

  return hours
}

export function calculateSwitchFrequency(logs: LogEntry[]): SwitchData[] {
  const hourMap = new Map<number, number>()

  const switchLogs = logs.filter(l => l.event === 'SWITCH_FOCUS')
  for (const log of switchLogs) {
    const hour = parseTime(log.time).getHours()
    hourMap.set(hour, (hourMap.get(hour) || 0) + 1)
  }

  const results: SwitchData[] = []
  for (let h = 0; h < 24; h++) {
    results.push({ hour: h, count: hourMap.get(h) || 0 })
  }

  return results
}

export function calculateSlotUtilization(logs: LogEntry[], currentActiveCount: number): SlotData {
  // For historical snapshots, we work backwards from current state
  const sortedLogs = [...logs].sort((a, b) =>
    parseTime(b.time).getTime() - parseTime(a.time).getTime() // Reverse order (newest first)
  )

  const snapshots: SlotSnapshot[] = []
  let activeCount = currentActiveCount

  // Add current state as the latest snapshot
  snapshots.push({
    time: new Date(),
    activeCount: currentActiveCount,
  })

  // Work backwards through logs to reconstruct history
  for (const log of sortedLogs) {
    // Reverse the operations to get previous state
    if (log.event === 'TASK_CREATED' || log.event === 'MOVE_TO_ACTIVE') {
      activeCount = Math.max(0, activeCount - 1) // Before this event, there was one less
    } else if (log.event === 'TASK_DONE' || log.event === 'TASK_DELETED' || log.event === 'MOVE_TO_LATER') {
      activeCount = Math.min(5, activeCount + 1) // Before this event, there was one more
    }

    snapshots.push({
      time: parseTime(log.time),
      activeCount,
    })
  }

  // Reverse to chronological order
  snapshots.reverse()

  return {
    currentActive: currentActiveCount,
    snapshots,
  }
}

export function calculateDailyStats(logs: LogEntry[], sessions: FocusSession[]): DailyStats {
  // Cleared = mental threads that were closed (done or deleted)
  const cleared = logs.filter(l => l.event === 'TASK_DONE' || l.event === 'TASK_DELETED').length
  const switches = logs.filter(l => l.event === 'SWITCH_FOCUS').length

  const focusDurations = sessions.map(s => s.durationMinutes)
  const totalFocusMinutes = focusDurations.reduce((a, b) => a + b, 0)
  const avgFocusMinutes = focusDurations.length > 0
    ? totalFocusMinutes / focusDurations.length
    : 0
  const longestFocusMinutes = focusDurations.length > 0
    ? Math.max(...focusDurations)
    : 0

  // Focus-based score (0-100)
  // - Total focus time: up to 50 points (4h = 50pts)
  // - Average session length: up to 30 points (30min avg = 30pts)
  // - Context switch penalty: -2 per switch over 5
  const focusTimeScore = Math.min(50, (totalFocusMinutes / 240) * 50)
  const avgSessionScore = Math.min(30, (avgFocusMinutes / 30) * 30)
  const switchPenalty = Math.max(0, (switches - 5) * 2)
  const baseScore = focusTimeScore + avgSessionScore - switchPenalty

  // Bonus for deep work (sessions > 45min)
  const deepWorkSessions = sessions.filter(s => s.durationMinutes >= 45).length
  const deepWorkBonus = Math.min(20, deepWorkSessions * 10)

  const score = Math.max(0, Math.min(100, baseScore + deepWorkBonus))

  return {
    cleared,
    switches,
    totalFocusMinutes,
    avgFocusMinutes,
    longestFocusMinutes,
    score,
  }
}

export function formatDuration(minutes: number): string {
  if (minutes < 1) return '<1m'
  if (minutes < 60) return `${Math.round(minutes)}m`
  const hours = Math.floor(minutes / 60)
  const mins = Math.round(minutes % 60)
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
}

export function getTimeRange(logs: LogEntry[]): { start: number; end: number } {
  if (logs.length === 0) {
    const now = new Date()
    return { start: 8, end: 18 }
  }

  const times = logs.map(l => parseTime(l.time).getHours())
  const minHour = Math.max(0, Math.min(...times) - 1)
  const maxHour = Math.min(23, Math.max(...times) + 1)

  return { start: minHour, end: maxHour }
}
