import { useEffect, useMemo, useState } from 'react'
import { getCurrentWindow } from '@tauri-apps/api/window'
import { useAppStore } from '../../store/useAppStore'
import { onSettingsMessage } from '../../lib/broadcast'
import {
  calculateFocusSessions,
  calculateTaskFocusTimes,
  calculateHourlyActivity,
  calculateSwitchFrequency,
  calculateSlotUtilization,
  calculateDailyStats,
} from '../../lib/chartUtils'
import { generateMockLogs } from '../../lib/mockData'
import { DailyScoreCard } from './DailyScoreCard'
import { FocusTimeline } from './FocusTimeline'
import { FocusDonut } from './FocusDonut'
import { ActivityHeatmap } from './ActivityHeatmap'
import { SwitchFrequency } from './SwitchFrequency'
import { SlotUtilization } from './SlotUtilization'

export function StatsWindow() {
  const { logs: realLogs, tasks: realTasks, loadData } = useAppStore()
  const [useMockData, setUseMockData] = useState(false)

  // Use mock data if enabled or if no real data exists
  const logs = useMemo(() => {
    if (useMockData || realLogs.length === 0) {
      return generateMockLogs()
    }
    return realLogs
  }, [realLogs, useMockData])

  // Current active slot count (from real tasks or mock)
  const currentActiveCount = useMemo(() => {
    if (useMockData || realLogs.length === 0) {
      return 3 // Mock: 3 active slots
    }
    return realTasks.filter(t => t.status === 'active').length
  }, [realTasks, useMockData, realLogs.length])

  useEffect(() => {
    loadData()

    onSettingsMessage((message) => {
      if (message.type === 'data-updated') {
        loadData()
      }
    })

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        getCurrentWindow().close()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [loadData])

  // Compute all chart data
  const sessions = useMemo(() => calculateFocusSessions(logs), [logs])
  const taskFocusTimes = useMemo(() => calculateTaskFocusTimes(sessions), [sessions])
  const hourlyActivity = useMemo(() => calculateHourlyActivity(logs), [logs])
  const switchData = useMemo(() => calculateSwitchFrequency(logs), [logs])
  const slotData = useMemo(() => calculateSlotUtilization(logs, currentActiveCount), [logs, currentActiveCount])
  const dailyStats = useMemo(() => calculateDailyStats(logs, sessions), [logs, sessions])

  return (
    <div className="stats-window">
      {/* Scan-line overlay for texture */}
      <div className="stats-scanlines" />

      {/* Header */}
      <header className="stats-header">
        <div className="stats-header-content">
          <div className="stats-header-left">
            <span className={`stats-header-badge ${useMockData || realLogs.length === 0 ? 'mock' : ''}`}>
              {useMockData || realLogs.length === 0 ? 'DEMO' : 'LIVE'}
            </span>
            <h1 className="stats-title">Focus Statistics</h1>
          </div>
          <div className="stats-header-right">
            <button
              className={`stats-mock-toggle ${useMockData ? 'active' : ''}`}
              onClick={() => setUseMockData(!useMockData)}
              title="Toggle mock data for testing"
            >
              {useMockData ? 'Show Real' : 'Show Demo'}
            </button>
            <span className="stats-date">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              })}
            </span>
            <kbd className="stats-kbd">ESC</kbd>
          </div>
        </div>
        <div className="stats-header-line" />
      </header>

      {/* Main Grid */}
      <main className="stats-grid">
        {/* Featured: Daily Score Card */}
        <div className="stats-card stats-card-featured" style={{ '--delay': '0' } as React.CSSProperties}>
          <DailyScoreCard stats={dailyStats} />
        </div>

        {/* Focus Timeline */}
        <div className="stats-card" style={{ '--delay': '1' } as React.CSSProperties}>
          <div className="stats-card-header">
            <h2 className="stats-card-title">Focus Timeline</h2>
            <span className="stats-card-subtitle">Today's focus sessions</span>
          </div>
          <div className="stats-card-content">
            <FocusTimeline sessions={sessions} />
          </div>
        </div>

        {/* Activity Heatmap */}
        <div className="stats-card" style={{ '--delay': '2' } as React.CSSProperties}>
          <div className="stats-card-header">
            <h2 className="stats-card-title">Activity Heatmap</h2>
            <span className="stats-card-subtitle">Events by hour</span>
          </div>
          <div className="stats-card-content">
            <ActivityHeatmap data={hourlyActivity} />
          </div>
        </div>

        {/* Focus Distribution */}
        <div className="stats-card" style={{ '--delay': '3' } as React.CSSProperties}>
          <div className="stats-card-header">
            <h2 className="stats-card-title">Focus Distribution</h2>
            <span className="stats-card-subtitle">Time per task</span>
          </div>
          <div className="stats-card-content">
            <FocusDonut data={taskFocusTimes} />
          </div>
        </div>

        {/* Switch Frequency */}
        <div className="stats-card" style={{ '--delay': '4' } as React.CSSProperties}>
          <div className="stats-card-header">
            <h2 className="stats-card-title">Context Switches</h2>
            <span className="stats-card-subtitle">Focus changes by hour</span>
          </div>
          <div className="stats-card-content">
            <SwitchFrequency data={switchData} />
          </div>
        </div>

        {/* Slot Utilization */}
        <div className="stats-card" style={{ '--delay': '5' } as React.CSSProperties}>
          <div className="stats-card-header">
            <h2 className="stats-card-title">Slot Utilization</h2>
            <span className="stats-card-subtitle">Active tasks over time</span>
          </div>
          <div className="stats-card-content">
            <SlotUtilization data={slotData} />
          </div>
        </div>
      </main>
    </div>
  )
}
