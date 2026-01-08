import { useEffect } from 'react'
import { cn } from '../../lib/utils'
import { IconButton } from '../ui/IconButton'
import { ChartIcon, CloseIcon, FileTextIcon } from '../ui/Icons'
import { useAppStore } from '../../store/useAppStore'
import { tauriApi } from '../../lib/tauri'

export function LogOverlay() {
  const {
    isLogOverlayVisible,
    toggleLogOverlay,
    logs,
    opacity,
    setOpacity,
  } = useAppStore()

  // Calculate stats
  const completedCount = logs.filter((l) => l.event === 'TASK_DONE').length
  const switchCount = logs.filter((l) => l.event === 'SWITCH_FOCUS').length
  const totalEvents = logs.length

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      toggleLogOverlay()
    }
  }

  const handleOpenLogWindow = async () => {
    await tauriApi.openLogWindow()
    toggleLogOverlay()
  }

  const handleOpenStatsWindow = async () => {
    await tauriApi.openStatsWindow()
    toggleLogOverlay()
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isLogOverlayVisible) {
        toggleLogOverlay()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isLogOverlayVisible, toggleLogOverlay])

  return (
    <div
      className={cn('log-overlay', isLogOverlayVisible && 'visible')}
      onClick={handleOverlayClick}
    >
      <div className="log-panel">
        <div className="log-handle" />
        <div className="log-header">
          <span className="log-title">Settings</span>
          <div className="log-actions">
            <IconButton onClick={handleOpenStatsWindow} title="Open Statistics">
              <ChartIcon />
            </IconButton>
            <IconButton onClick={handleOpenLogWindow} title="Open Activity Log">
              <FileTextIcon />
            </IconButton>
            <IconButton onClick={toggleLogOverlay} title="Close">
              <CloseIcon />
            </IconButton>
          </div>
        </div>

        <div className="opacity-section">
          <span className="opacity-label">Opacity</span>
          <div className="opacity-row">
            <input
              type="range"
              className="opacity-slider-wide"
              min="30"
              max="100"
              value={opacity}
              onChange={(e) => setOpacity(parseInt(e.target.value))}
            />
            <span className="opacity-value">{opacity}%</span>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{completedCount}</div>
            <div className="stat-label">Done</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{switchCount}</div>
            <div className="stat-label">Switches</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{totalEvents}</div>
            <div className="stat-label">Events</div>
          </div>
        </div>
      </div>
    </div>
  )
}
