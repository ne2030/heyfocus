import type { LogEntry } from '../types'

// Generate realistic mock data for testing stats visualizations
export function generateMockLogs(): LogEntry[] {
  const logs: LogEntry[] = []
  const today = new Date()
  const tasks = [
    { id: 1, text: 'Implement user authentication' },
    { id: 2, text: 'Fix database connection bug' },
    { id: 3, text: 'Write unit tests' },
    { id: 4, text: 'Review pull requests' },
    { id: 5, text: 'Update documentation' },
    { id: 6, text: 'Refactor API endpoints' },
  ]

  // Helper to format time
  const formatTime = (hour: number, minute: number) => {
    const d = new Date(today)
    d.setHours(hour, minute, 0, 0)
    return d.toISOString()
  }

  // Create tasks in the morning
  tasks.forEach((task, i) => {
    logs.push({
      time: formatTime(8, i * 5),
      event: 'TASK_CREATED',
      task: task.text,
      task_id: task.id,
    })
  })

  // Simulate a realistic work day with focus sessions
  const workSessions = [
    // Morning deep work
    { hour: 8, minute: 30, taskIdx: 0, event: 'SWITCH_FOCUS' as const },
    { hour: 10, minute: 15, taskIdx: 1, event: 'SWITCH_FOCUS' as const },
    { hour: 10, minute: 45, taskIdx: 1, event: 'TASK_DONE' as const },
    { hour: 10, minute: 50, taskIdx: 2, event: 'SWITCH_FOCUS' as const },
    { hour: 11, minute: 30, taskIdx: 0, event: 'SWITCH_FOCUS' as const },
    { hour: 12, minute: 0, event: 'CLEAR_FOCUS' as const },

    // Afternoon work
    { hour: 13, minute: 0, taskIdx: 3, event: 'SWITCH_FOCUS' as const },
    { hour: 13, minute: 45, taskIdx: 3, event: 'TASK_DONE' as const },
    { hour: 14, minute: 0, taskIdx: 0, event: 'SWITCH_FOCUS' as const },
    { hour: 15, minute: 30, taskIdx: 4, event: 'SWITCH_FOCUS' as const },
    { hour: 16, minute: 0, taskIdx: 5, event: 'SWITCH_FOCUS' as const },
    { hour: 16, minute: 45, taskIdx: 0, event: 'SWITCH_FOCUS' as const },
    { hour: 17, minute: 30, taskIdx: 0, event: 'TASK_DONE' as const },

    // Evening
    { hour: 17, minute: 35, taskIdx: 2, event: 'SWITCH_FOCUS' as const },
    { hour: 18, minute: 15, taskIdx: 2, event: 'TASK_DONE' as const },
  ]

  let prevFocusId: number | undefined

  workSessions.forEach((session) => {
    const task = session.taskIdx !== undefined ? tasks[session.taskIdx] : undefined

    if (session.event === 'SWITCH_FOCUS' && task) {
      logs.push({
        time: formatTime(session.hour, session.minute),
        event: 'SWITCH_FOCUS',
        task: task.text,
        task_id: task.id,
        prev_focus_id: prevFocusId,
      })
      prevFocusId = task.id
    } else if (session.event === 'CLEAR_FOCUS') {
      logs.push({
        time: formatTime(session.hour, session.minute),
        event: 'CLEAR_FOCUS',
        task: '',
        prev_focus_id: prevFocusId,
      })
      prevFocusId = undefined
    } else if (session.event === 'TASK_DONE' && task) {
      logs.push({
        time: formatTime(session.hour, session.minute),
        event: 'TASK_DONE',
        task: task.text,
        task_id: task.id,
      })
    }
  })

  // Add some task movements
  logs.push({
    time: formatTime(9, 0),
    event: 'MOVE_TO_LATER',
    task: tasks[4].text,
    task_id: tasks[4].id,
    prev_status: 'active',
  })

  logs.push({
    time: formatTime(14, 30),
    event: 'MOVE_TO_ACTIVE',
    task: tasks[4].text,
    task_id: tasks[4].id,
    prev_status: 'later',
  })

  // Sort by time
  logs.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime())

  return logs
}
