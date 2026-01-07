import { useEffect } from 'react'
import { cn } from '../../lib/utils'
import { formatTime } from '../../lib/utils'
import { IconButton } from '../ui/IconButton'
import { CloseIcon, FileTextIcon } from '../ui/Icons'
import { useAppStore } from '../../store/useAppStore'
import { tauriApi } from '../../lib/tauri'
import type { LogEventType } from '../../types'

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

        <div className="log-content">
          {logs.length === 0 ? (
            <div className="log-empty">No activity yet</div>
          ) : (
            [...logs].reverse().map((log, i) => (
              <div className="log-entry" key={i}>
                <span className="log-time">{formatTime(log.time)}</span>
                <span className={cn('log-event', log.event)}>{formatEventType(log.event)}</span>
                <span className="log-task">{log.task}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

function formatEventType(event: LogEventType): string {
  const map: Record<LogEventType, string> = {
    TASK_CREATED: 'Created',
    TASK_DONE: 'Done',
    TASK_DELETED: 'Deleted',
    TASK_EDITED: 'Edited',
    MOVE_TO_ACTIVE: 'Active',
    MOVE_TO_LATER: 'Later',
    SWITCH_FOCUS: 'Focus',
    CLEAR_FOCUS: 'Unfocus',
  }
  return map[event] || event
}
