import { useEffect, useState, useRef } from 'react'
import { cn } from './lib/utils'
import { useAppStore } from './store/useAppStore'
import { onSettingsMessage } from './lib/broadcast'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import { useWindowResize } from './hooks/useWindowResize'
import { Header } from './components/sections/Header'
import { ActiveSection } from './components/sections/ActiveSection'
import { LaterSection } from './components/sections/LaterSection'
import { AddTaskForm } from './components/sections/AddTaskForm'
import { LogOverlay } from './components/log/LogOverlay'
import { LogWindow } from './components/log/LogWindow'
import { Toast } from './components/Toast'

function App() {
  const [isLogWindow] = useState(() => window.location.hash === '#log')

  if (isLogWindow) {
    return <LogWindow />
  }

  return <MainApp />
}

function MainApp() {
  const { isCompactMode, loadData, opacity } = useAppStore()
  const mainRef = useRef<HTMLElement>(null)

  // Custom hooks
  useKeyboardShortcuts()
  useWindowResize(mainRef)

  useEffect(() => {
    // Load initial data
    loadData()

    // Apply initial opacity
    document.documentElement.style.setProperty('--bg-alpha', String(opacity / 100))

    // Listen for settings changes from log window
    onSettingsMessage((message) => {
      if (message.type === 'opacity' && message.value !== null) {
        document.documentElement.style.setProperty('--bg-alpha', String(message.value / 100))
        useAppStore.setState({ opacity: message.value })
      } else if (message.type === 'data-updated') {
        loadData()
      }
    })
  }, [])

  return (
    <div className={cn('app', isCompactMode && 'compact')}>
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
