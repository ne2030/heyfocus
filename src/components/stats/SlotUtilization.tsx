import { useMemo } from 'react'
import type { SlotData } from '../../lib/chartUtils'

interface Props {
  data: SlotData
}

export function SlotUtilization({ data }: Props) {
  const { currentSlots, avgSlots, maxSlots } = useMemo(() => {
    const { currentActive, snapshots } = data

    if (snapshots.length === 0) {
      return { currentSlots: currentActive, avgSlots: currentActive, maxSlots: currentActive }
    }

    const avg = snapshots.reduce((sum, d) => sum + d.activeCount, 0) / snapshots.length
    const max = Math.max(...snapshots.map(d => d.activeCount))

    return {
      currentSlots: currentActive,
      avgSlots: avg,
      maxSlots: max,
    }
  }, [data])

  const snapshots = data.snapshots

  // Slot indicators
  const slots = Array.from({ length: 5 }, (_, i) => i + 1)

  return (
    <div className="slots-container">
      {/* Visual Gauge */}
      <div className="slots-gauge">
        {slots.map((slot) => {
          const isFilled = slot <= currentSlots
          const isMax = slot === 5 && currentSlots === 5

          return (
            <div
              key={slot}
              className={`slots-indicator ${isFilled ? 'filled' : ''} ${isMax ? 'max' : ''}`}
              style={{
                '--delay': `${slot * 0.1}s`,
              } as React.CSSProperties}
            >
              <div className="slots-indicator-inner" />
            </div>
          )
        })}
      </div>

      {/* Current status */}
      <div className="slots-current">
        <span className="slots-current-value">{currentSlots}</span>
        <span className="slots-current-max">/ 5</span>
        <span className="slots-current-label">Active Slots</span>
      </div>

      {/* Mini chart */}
      {snapshots.length > 1 && (
        <div className="slots-chart">
          <svg viewBox="0 0 100 30" preserveAspectRatio="none">
            {/* Area */}
            <path
              d={`
                M 0 30
                ${snapshots.map((d, i) => {
                  const x = (i / (snapshots.length - 1)) * 100
                  const y = 30 - (d.activeCount / 5) * 25
                  return `L ${x} ${y}`
                }).join(' ')}
                L 100 30
                Z
              `}
              fill="url(#slotGradient)"
              opacity="0.4"
            />

            {/* Line */}
            <path
              d={snapshots.map((d, i) => {
                const x = (i / (snapshots.length - 1)) * 100
                const y = 30 - (d.activeCount / 5) * 25
                return `${i === 0 ? 'M' : 'L'} ${x} ${y}`
              }).join(' ')}
              fill="none"
              stroke="var(--info)"
              strokeWidth="1.5"
              strokeLinecap="round"
            />

            {/* Gradient */}
            <defs>
              <linearGradient id="slotGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--info)" stopOpacity="0.6" />
                <stop offset="100%" stopColor="var(--info)" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      )}

      {/* Stats */}
      <div className="slots-stats">
        <div className="slots-stat">
          <span className="slots-stat-label">Average</span>
          <span className="slots-stat-value">{avgSlots.toFixed(1)}</span>
        </div>
        <div className="slots-stat">
          <span className="slots-stat-label">Peak</span>
          <span className="slots-stat-value">{maxSlots}</span>
        </div>
      </div>
    </div>
  )
}
