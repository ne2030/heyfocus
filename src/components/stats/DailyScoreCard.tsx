import { formatDuration, type DailyStats } from '../../lib/chartUtils'

interface Props {
  stats: DailyStats
}

export function DailyScoreCard({ stats }: Props) {
  const { score, cleared, switches, totalFocusMinutes, avgFocusMinutes, longestFocusMinutes } = stats

  // Calculate score ring
  const radius = 54
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (score / 100) * circumference

  // Score color based on value
  const getScoreColor = () => {
    if (score >= 80) return '#10b981' // emerald
    if (score >= 60) return '#f97316' // orange
    if (score >= 40) return '#f59e0b' // amber
    return '#ef4444' // red
  }

  const getScoreLabel = () => {
    if (score >= 80) return 'Excellent'
    if (score >= 60) return 'Good'
    if (score >= 40) return 'Fair'
    return 'Needs Work'
  }

  return (
    <div className="score-card">
      {/* Score Ring */}
      <div className="score-ring-container">
        <svg className="score-ring" viewBox="0 0 128 128">
          {/* Background ring */}
          <circle
            cx="64"
            cy="64"
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="8"
          />
          {/* Score ring */}
          <circle
            cx="64"
            cy="64"
            r={radius}
            fill="none"
            stroke={getScoreColor()}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{
              transform: 'rotate(-90deg)',
              transformOrigin: 'center',
              transition: 'stroke-dashoffset 1s ease-out',
            }}
          />
          {/* Glow effect */}
          <circle
            cx="64"
            cy="64"
            r={radius}
            fill="none"
            stroke={getScoreColor()}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{
              transform: 'rotate(-90deg)',
              transformOrigin: 'center',
              filter: 'blur(8px)',
              opacity: 0.5,
            }}
          />
        </svg>
        <div className="score-value-container">
          <span className="score-value">{Math.round(score)}</span>
          <span className="score-label">{getScoreLabel()}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="score-stats">
        <div className="score-stat">
          <span className="score-stat-value">{formatDuration(totalFocusMinutes)}</span>
          <span className="score-stat-label">Total Focus</span>
        </div>
        <div className="score-stat">
          <span className="score-stat-value">{formatDuration(avgFocusMinutes)}</span>
          <span className="score-stat-label">Avg Session</span>
        </div>
        <div className="score-stat">
          <span className="score-stat-value">{switches}</span>
          <span className="score-stat-label">Switches</span>
        </div>
        <div className="score-stat">
          <span className="score-stat-value">{cleared}</span>
          <span className="score-stat-label">Cleared</span>
        </div>
      </div>
    </div>
  )
}
