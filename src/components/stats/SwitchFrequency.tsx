import { useMemo } from 'react'
import type { SwitchData } from '../../lib/chartUtils'

interface Props {
  data: SwitchData[]
}

export function SwitchFrequency({ data }: Props) {
  const { maxCount, totalSwitches, displayData, peakHours } = useMemo(() => {
    // Show hours 6-23 (waking hours)
    const display = data.slice(6, 24)
    const max = Math.max(...display.map(d => d.count), 1)
    const total = display.reduce((sum, d) => sum + d.count, 0)
    // Find ALL hours with max count
    const peaks = display.filter(d => d.count === max && d.count > 0).map(d => d.hour)
    return { maxCount: max, totalSwitches: total, displayData: display, peakHours: peaks }
  }, [data])

  // Intensity level for color coding
  const getIntensity = (count: number) => {
    if (count === 0) return 'none'
    const ratio = count / maxCount
    if (ratio >= 0.8) return 'high'
    if (ratio >= 0.4) return 'medium'
    return 'low'
  }

  return (
    <div className="switch-pulse">
      {/* Stem Grid */}
      <div className="switch-grid">
        {displayData.map((d, i) => {
          const height = d.count > 0 ? Math.max(15, (d.count / maxCount) * 100) : 0
          const isPeak = peakHours.includes(d.hour)
          const intensity = getIntensity(d.count)

          return (
            <div
              key={d.hour}
              className={`switch-stem-container ${isPeak ? 'peak' : ''}`}
              style={{ '--delay': `${i * 0.03}s` } as React.CSSProperties}
            >
              {/* Stem track - stems grow upward */}
              <div className="switch-track">
                {d.count > 0 && (
                  <>
                    {/* Count label - separate from dot to avoid animation */}
                    <span
                      className={`switch-count ${intensity} ${isPeak ? 'peak' : ''}`}
                      style={{ '--height': `${height}%` } as React.CSSProperties}
                    >
                      {d.count}
                    </span>

                    {/* Dot at top */}
                    <div
                      className={`switch-dot ${intensity} ${isPeak ? 'peak' : ''}`}
                      style={{ '--height': `${height}%` } as React.CSSProperties}
                    />

                    {/* Stem line */}
                    <div
                      className={`switch-stem ${intensity}`}
                      style={{ '--height': `${height}%` } as React.CSSProperties}
                    />
                  </>
                )}
              </div>

              {/* Hour label at bottom */}
              <span className="switch-hour">
                {d.hour.toString().padStart(2, '0')}
              </span>
            </div>
          )
        })}
      </div>

      {/* Summary footer */}
      <div className="switch-footer">
        <div className="switch-metric">
          <span className="switch-metric-value">{totalSwitches}</span>
          <span className="switch-metric-label">switches</span>
        </div>
        <div className="switch-divider" />
        <div className="switch-metric">
          <span className="switch-metric-value">{maxCount}</span>
          <span className="switch-metric-label">peak/hr</span>
        </div>
        {peakHours.length > 0 && maxCount > 0 && (
          <>
            <div className="switch-divider" />
            <div className="switch-metric peak">
              <span className="switch-metric-value">
                {peakHours.length === 1
                  ? `${peakHours[0].toString().padStart(2, '0')}:00`
                  : peakHours.map(h => h.toString().padStart(2, '0')).join(', ')}
              </span>
              <span className="switch-metric-label">busiest</span>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
