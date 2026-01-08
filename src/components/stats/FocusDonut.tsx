import { useMemo } from 'react'
import { formatDuration, type TaskFocusTime } from '../../lib/chartUtils'

interface Props {
  data: TaskFocusTime[]
}

export function FocusDonut({ data }: Props) {
  const { segments, totalMinutes } = useMemo(() => {
    const total = data.reduce((sum, d) => sum + d.totalMinutes, 0)

    if (total === 0) {
      return { segments: [], totalMinutes: 0 }
    }

    const radius = 45
    const circumference = 2 * Math.PI * radius
    let currentOffset = 0

    const segs = data.slice(0, 6).map((task) => {
      const percentage = task.totalMinutes / total
      const dashLength = percentage * circumference
      const offset = currentOffset
      currentOffset += dashLength

      return {
        ...task,
        percentage,
        dashLength,
        dashOffset: -offset,
        circumference,
      }
    })

    return { segments: segs, totalMinutes: total }
  }, [data])

  if (data.length === 0) {
    return (
      <div className="donut-empty">
        <div className="donut-empty-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="10" strokeDasharray="4 4" />
          </svg>
        </div>
        <span>No focus data</span>
      </div>
    )
  }

  return (
    <div className="donut-container">
      {/* Donut Chart */}
      <div className="donut-chart">
        <svg viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="rgba(255,255,255,0.04)"
            strokeWidth="10"
          />

          {/* Segments */}
          {segments.map((seg, idx) => (
            <circle
              key={seg.taskId}
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke={seg.color}
              strokeWidth="10"
              strokeDasharray={`${seg.dashLength} ${seg.circumference - seg.dashLength}`}
              strokeDashoffset={seg.dashOffset}
              style={{
                transform: 'rotate(-90deg)',
                transformOrigin: 'center',
                transition: 'stroke-dasharray 0.8s ease-out, stroke-dashoffset 0.8s ease-out',
                transitionDelay: `${idx * 0.1}s`,
              }}
            />
          ))}
        </svg>

        {/* Center content */}
        <div className="donut-center">
          <span className="donut-total">{formatDuration(totalMinutes)}</span>
          <span className="donut-label">Total Focus</span>
        </div>
      </div>

      {/* Legend */}
      <div className="donut-legend">
        {segments.map((seg) => (
          <div key={seg.taskId} className="donut-legend-item">
            <span
              className="donut-legend-color"
              style={{ backgroundColor: seg.color }}
            />
            <span className="donut-legend-name" title={seg.taskName}>
              {seg.taskName.length > 20
                ? seg.taskName.slice(0, 20) + '...'
                : seg.taskName}
            </span>
            <span className="donut-legend-value">
              {Math.round(seg.percentage * 100)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
