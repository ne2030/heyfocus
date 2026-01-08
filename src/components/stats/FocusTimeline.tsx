import { useMemo, useState } from 'react'
import { formatDuration, type FocusSession } from '../../lib/chartUtils'

interface Props {
  sessions: FocusSession[]
}

const COLORS = [
  { bg: '#f97316', glow: 'rgba(249, 115, 22, 0.4)' },   // orange
  { bg: '#3b82f6', glow: 'rgba(59, 130, 246, 0.4)' },   // blue
  { bg: '#10b981', glow: 'rgba(16, 185, 129, 0.4)' },   // emerald
  { bg: '#8b5cf6', glow: 'rgba(139, 92, 246, 0.4)' },   // violet
  { bg: '#ec4899', glow: 'rgba(236, 72, 153, 0.4)' },   // pink
  { bg: '#06b6d4', glow: 'rgba(6, 182, 212, 0.4)' },    // cyan
]

export function FocusTimeline({ sessions }: Props) {
  const [hoveredSession, setHoveredSession] = useState<number | null>(null)

  const { timeRange, taskMap, taskOrder, totalMinutes } = useMemo(() => {
    if (sessions.length === 0) {
      return {
        timeRange: { start: 8, end: 18 },
        taskMap: new Map<number, { name: string; color: typeof COLORS[0]; sessions: FocusSession[] }>(),
        taskOrder: [] as number[],
        totalMinutes: 0,
      }
    }

    // Calculate time range
    const startTimes = sessions.map(s => s.startTime.getHours())
    const endTimes = sessions.map(s => s.endTime.getHours() + (s.endTime.getMinutes() > 0 ? 1 : 0))
    const minHour = Math.max(0, Math.min(...startTimes) - 1)
    const maxHour = Math.min(23, Math.max(...endTimes) + 1)

    // Group sessions by task
    const tasks = new Map<number, { name: string; color: typeof COLORS[0]; sessions: FocusSession[] }>()
    const order: number[] = []
    let colorIdx = 0

    sessions.forEach(s => {
      if (!tasks.has(s.taskId)) {
        tasks.set(s.taskId, {
          name: s.taskName,
          color: COLORS[colorIdx % COLORS.length],
          sessions: [],
        })
        order.push(s.taskId)
        colorIdx++
      }
      tasks.get(s.taskId)!.sessions.push(s)
    })

    const total = sessions.reduce((sum, s) => sum + s.durationMinutes, 0)

    return {
      timeRange: { start: minHour, end: maxHour },
      taskMap: tasks,
      taskOrder: order,
      totalMinutes: total,
    }
  }, [sessions])

  const hourSpan = timeRange.end - timeRange.start + 1
  const hours = Array.from({ length: hourSpan }, (_, i) => timeRange.start + i)

  const getPosition = (date: Date) => {
    const hours = date.getHours()
    const minutes = date.getMinutes()
    const totalMinutesFromStart = (hours - timeRange.start) * 60 + minutes
    const totalMinutesInRange = hourSpan * 60
    return (totalMinutesFromStart / totalMinutesInRange) * 100
  }

  const getWidth = (start: Date, end: Date) => {
    const durationMinutes = (end.getTime() - start.getTime()) / 60000
    const totalMinutesInRange = hourSpan * 60
    return (durationMinutes / totalMinutesInRange) * 100
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
  }

  if (sessions.length === 0) {
    return (
      <div className="tl-empty">
        <div className="tl-empty-visual">
          <div className="tl-empty-line" />
          <div className="tl-empty-dots">
            {[0, 1, 2].map(i => (
              <div key={i} className="tl-empty-dot" style={{ '--i': i } as React.CSSProperties} />
            ))}
          </div>
        </div>
        <span className="tl-empty-text">No focus sessions yet</span>
      </div>
    )
  }

  return (
    <div className="tl">
      {/* Time ruler */}
      <div className="tl-ruler">
        {hours.map((hour, i) => (
          <div
            key={hour}
            className="tl-hour"
            style={{ left: `${(i / hourSpan) * 100}%` }}
          >
            <span className="tl-hour-label">{hour.toString().padStart(2, '0')}</span>
            <div className="tl-hour-tick" />
          </div>
        ))}
        <div className="tl-ruler-line" />
      </div>

      {/* Swim lanes */}
      <div className="tl-lanes">
        {taskOrder.map((taskId, laneIdx) => {
          const task = taskMap.get(taskId)!
          return (
            <div
              key={taskId}
              className="tl-lane"
              style={{ '--delay': `${laneIdx * 0.1}s` } as React.CSSProperties}
            >
              {/* Task label */}
              <div className="tl-lane-label">
                <span
                  className="tl-lane-dot"
                  style={{ backgroundColor: task.color.bg }}
                />
                <span className="tl-lane-name" title={task.name}>
                  {task.name.length > 16 ? task.name.slice(0, 16) + '…' : task.name}
                </span>
              </div>

              {/* Session track */}
              <div className="tl-lane-track">
                {/* Grid lines */}
                {hours.map((_, i) => (
                  <div
                    key={i}
                    className="tl-grid-line"
                    style={{ left: `${(i / hourSpan) * 100}%` }}
                  />
                ))}

                {/* Sessions */}
                {task.sessions.map((session, idx) => {
                  const left = getPosition(session.startTime)
                  const width = getWidth(session.startTime, session.endTime)
                  const isHovered = hoveredSession === session.startTime.getTime()
                  const globalIdx = sessions.findIndex(s => s.startTime.getTime() === session.startTime.getTime())

                  return (
                    <div
                      key={idx}
                      className={`tl-session ${isHovered ? 'hovered' : ''}`}
                      style={{
                        left: `${left}%`,
                        width: `${Math.max(width, 1)}%`,
                        '--color': task.color.bg,
                        '--glow': task.color.glow,
                        '--idx': globalIdx,
                      } as React.CSSProperties}
                      onMouseEnter={() => setHoveredSession(session.startTime.getTime())}
                      onMouseLeave={() => setHoveredSession(null)}
                    >
                      {/* Tooltip */}
                      {isHovered && (
                        <div className="tl-tooltip">
                          <span className="tl-tooltip-time">
                            {formatTime(session.startTime)} – {formatTime(session.endTime)}
                          </span>
                          <span className="tl-tooltip-duration">
                            {formatDuration(session.durationMinutes)}
                          </span>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <div className="tl-footer">
        <div className="tl-stat">
          <span className="tl-stat-value">{formatDuration(totalMinutes)}</span>
          <span className="tl-stat-label">total focus</span>
        </div>
        <div className="tl-stat">
          <span className="tl-stat-value">{taskOrder.length}</span>
          <span className="tl-stat-label">{taskOrder.length === 1 ? 'task' : 'tasks'}</span>
        </div>
        <div className="tl-stat">
          <span className="tl-stat-value">{sessions.length}</span>
          <span className="tl-stat-label">{sessions.length === 1 ? 'session' : 'sessions'}</span>
        </div>
      </div>
    </div>
  )
}
