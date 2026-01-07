import { useEffect, useState } from 'react'
import { getCurrentWindow } from '@tauri-apps/api/window'
import { formatTime } from '../../lib/utils'
import { cn } from '../../lib/utils'
import { useAppStore } from '../../store/useAppStore'
import { onSettingsMessage } from '../../lib/broadcast'
import type { LogEventType } from '../../types'

export function LogWindow() {
  const { logs, loadData, clearLogs } = useAppStore()
  const [showConfirm, setShowConfirm] = useState(false)

  // Calculate stats
  const completedCount = logs.filter((l) => l.event === 'TASK_DONE').length
  const switchCount = logs.filter((l) => l.event === 'SWITCH_FOCUS').length

  useEffect(() => {
    loadData()

    // Listen for data changes from main window
    onSettingsMessage((message) => {
      if (message.type === 'data-updated') {
        loadData()
      }
    })

    // Handle escape key
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        getCurrentWindow().close()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <div className="settings-window">
      <div className="settings-section activity-section" style={{ paddingTop: 0 }}>
        <div className="activity-header">
          <span className="section-title">Activity Log</span>
          <div className="activity-stats">
            <span className="stat-pill">
              <span className="stat-num">{completedCount}</span> done
            </span>
            <span className="stat-pill">
              <span className="stat-num">{switchCount}</span> switches
            </span>
            {logs.length > 0 && (
              <button
                className="clear-logs-btn"
                onClick={() => setShowConfirm(true)}
              >
                Clear
              </button>
            )}
          </div>
        </div>
        <div className="activity-log">
          {logs.length === 0 ? (
            <div className="log-empty">No activity yet</div>
          ) : (
            [...logs].reverse().map((log, i) => (
              <div className="log-row" key={i}>
                <span className="log-time">{formatTime(log.time)}</span>
                <span className={cn('log-type', log.event)}>
                  {formatEventType(log.event)}
                </span>
                <span className="log-text">{log.task}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {showConfirm && (
        <div className="confirm-overlay">
          <div className="confirm-dialog">
            <p>Clear all logs?</p>
            <div className="confirm-actions">
              <button
                className="confirm-btn cancel"
                onClick={() => setShowConfirm(false)}
              >
                Cancel
              </button>
              <button
                className="confirm-btn confirm"
                onClick={() => {
                  clearLogs()
                  setShowConfirm(false)
                }}
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}

      {/*<div className="esc-hint">*/}
      {/*  <kbd>ESC</kbd> to close*/}
      {/*</div>*/}
    </div>
  )
}

function formatEventType(event: LogEventType): string {
  const map: Record<LogEventType, string> = {
    TASK_CREATED: 'CREATED',
    TASK_DONE: 'DONE',
    TASK_DELETED: 'DELETED',
    TASK_EDITED: 'EDITED',
    MOVE_TO_ACTIVE: 'ACTIVE',
    MOVE_TO_LATER: 'LATER',
    SWITCH_FOCUS: 'FOCUS',
    CLEAR_FOCUS: 'UNFOCUS',
  }
  return map[event] || event
}
