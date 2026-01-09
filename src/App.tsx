import { useEffect, useState, useRef } from 'react'
import { currentMonitor } from '@tauri-apps/api/window'
import { cn } from './lib/utils'
import { useAppStore } from './store/useAppStore'
import { onSettingsMessage } from './lib/broadcast'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import { useWindowResize } from './hooks/useWindowResize'
import { useWindowFocus } from './hooks/useWindowFocus'
import { Header } from './components/sections/Header'
import { ActiveSection } from './components/sections/ActiveSection'
import { LaterSection } from './components/sections/LaterSection'
import { AddTaskForm } from './components/sections/AddTaskForm'
import { LogOverlay } from './components/log/LogOverlay'
import { LogWindow } from './components/log/LogWindow'
import { StatsWindow } from './components/stats/StatsWindow'
import { Toast } from './components/Toast'

function App() {
  const [windowType] = useState(() => {
    const hash = window.location.hash
    if (hash === '#log') return 'log'
    if (hash === '#stats') return 'stats'
    return 'main'
  })

  if (windowType === 'log') {
    return <LogWindow />
  }

  if (windowType === 'stats') {
    return <StatsWindow />
  }

  return <MainApp />
}

function MainApp() {
  const { isCompactMode, loadData, opacity, setSelectedTask, setScaleFactor } = useAppStore()
  const mainRef = useRef<HTMLElement>(null)

  // Custom hooks
  useKeyboardShortcuts()
  useWindowResize(mainRef)
  const isWindowFocused = useWindowFocus()

  // Detect screen size and adjust scale factor
  useEffect(() => {
    const detectScreenSize = async () => {
      try {
        const monitor = await currentMonitor()
        if (monitor) {
          const logicalWidth = monitor.size.width / monitor.scaleFactor
          if (logicalWidth <= 1600) {
            setScaleFactor(0.7)
          }
        }
      } catch {
        // Silently fail - might not be in Tauri context
      }
    }
    detectScreenSize()
  }, [setScaleFactor])

  useEffect(() => {
    // Load initial data
    loadData()

    // Apply initial opacity
    const baseAlpha = opacity / 100
    const activeAlpha = baseAlpha + (1 - baseAlpha) / 2
    document.documentElement.style.setProperty('--bg-alpha', String(baseAlpha))
    document.documentElement.style.setProperty('--bg-alpha-active', String(activeAlpha))

    // Listen for settings changes from log window
    onSettingsMessage((message) => {
      if (message.type === 'opacity' && message.value !== null) {
        const base = message.value / 100
        const active = base + (1 - base) / 2
        document.documentElement.style.setProperty('--bg-alpha', String(base))
        document.documentElement.style.setProperty('--bg-alpha-active', String(active))
        useAppStore.setState({ opacity: message.value })
      } else if (message.type === 'data-updated') {
        loadData()
      }
    })
  }, [])

  return (
    <div className={cn('app', isCompactMode && 'compact', isWindowFocused && 'window-focused')} onClick={() => setSelectedTask(null)}>
      <Header />

      <main className="main" ref={mainRef}>
        <ActiveSection />
        <LaterSection />
        <AddTaskForm />
      </main>

      <LogOverlay />
      <Toast />
    </div>
  )
}

export default App
