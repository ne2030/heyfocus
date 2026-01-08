import { useMemo } from 'react'
import type { HourlyActivity } from '../../lib/chartUtils'

interface Props {
  data: HourlyActivity[]
}

export function ActivityHeatmap({ data }: Props) {
  const { maxCount, activeHours, peakHour } = useMemo(() => {
    const max = Math.max(...data.map(d => d.count), 1)
    const active = data.filter(d => d.count > 0).length
    const peak = data.reduce((max, d) => d.count > max.count ? d : max, data[0])
    return { maxCount: max, activeHours: active, peakHour: peak }
  }, [data])

  const getIntensity = (count: number) => {
    if (count === 0) return 0
    return Math.max(0.15, count / maxCount)
  }

  // Show hours 6-23 (relevant waking hours)
  const displayHours = data.slice(6, 24)

  return (
    <div className="heatmap">
      {/* Heatmap Grid */}
      <div className="heatmap-grid">
        {displayHours.map((hour) => {
          const intensity = getIntensity(hour.count)
          const isPeak = hour.hour === peakHour?.hour && hour.count > 0

          return (
            <div
              key={hour.hour}
              className={`heatmap-cell ${isPeak ? 'heatmap-cell-peak' : ''}`}
              style={{
                '--intensity': intensity,
                backgroundColor: hour.count > 0
                  ? `rgba(249, 115, 22, ${intensity})`
                  : 'rgba(255,255,255,0.03)',
              } as React.CSSProperties}
              title={`${hour.hour}:00 - ${hour.count} events`}
            >
              <span className="heatmap-cell-hour">
                {hour.hour.toString().padStart(2, '0')}
              </span>
              {hour.count > 0 && (
                <span className="heatmap-cell-count">{hour.count}</span>
              )}
            </div>
          )
        })}
      </div>

      {/* Summary */}
      <div className="heatmap-summary">
        <div className="heatmap-stat">
          <span className="heatmap-stat-label">Peak Hour</span>
          <span className="heatmap-stat-value">
            {peakHour && peakHour.count > 0
              ? `${peakHour.hour.toString().padStart(2, '0')}:00`
              : '--'}
          </span>
        </div>
        <div className="heatmap-stat">
          <span className="heatmap-stat-label">Active Hours</span>
          <span className="heatmap-stat-value">{activeHours}</span>
        </div>
      </div>

      {/* Scale */}
      <div className="heatmap-scale">
        <span className="heatmap-scale-label">Less</span>
        <div className="heatmap-scale-gradient" />
        <span className="heatmap-scale-label">More</span>
      </div>
    </div>
  )
}
