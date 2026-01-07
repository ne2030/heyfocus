import { useEffect, useCallback } from 'react'
import { useAppStore } from '../store/useAppStore'

export function useKeyboardShortcuts() {
  const {
    tasks,
    selectedTaskId,
    editingTaskId,
    isAlwaysOnTop,
    opacity,
    setSelectedTask,
    setEditingTask,
    setFocus,
    deleteTask,
    moveTask,
    undoAction,
    toggleCompactMode,
    toggleLogOverlay,
    setAlwaysOnTop,
    setOpacity,
    activeTasks,
  } = useAppStore()

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const active = e.target as HTMLElement
      const isInputFocused =
        active.tagName === 'INPUT' || active.tagName === 'TEXTAREA'

      // Always allow Escape
      if (e.key === 'Escape') {
        if (isInputFocused) {
          active.blur()
        } else if (editingTaskId !== null) {
          setEditingTask(null)
        } else if (selectedTaskId !== null) {
          setSelectedTask(null)
        }
        return
      }

      // Don't handle other keys when input is focused
      if (isInputFocused) return

      const isMeta = e.metaKey || e.ctrlKey
      const currentActiveTasks = activeTasks()

      // Cmd/Ctrl shortcuts
      if (isMeta) {
        switch (e.code) {
          case 'KeyP':
            e.preventDefault()
            setAlwaysOnTop(!isAlwaysOnTop)
            break
          case 'KeyS':
            e.preventDefault()
            toggleLogOverlay()
            break
          case 'KeyM':
            e.preventDefault()
            toggleCompactMode()
            break
          case 'KeyZ':
            e.preventDefault()
            undoAction()
            break
          case 'BracketLeft':
            e.preventDefault()
            setOpacity(Math.max(30, opacity - 5))
            break
          case 'BracketRight':
            e.preventDefault()
            setOpacity(Math.min(100, opacity + 5))
            break
          case 'Digit1':
          case 'Digit2':
          case 'Digit3':
          case 'Digit4':
          case 'Digit5':
            e.preventDefault()
            const index = parseInt(e.code.slice(-1)) - 1
            if (currentActiveTasks[index]) {
              setSelectedTask(currentActiveTasks[index].id)
            }
            break
        }
        return
      }

      // Selection-based shortcuts (when a task is selected and not editing)
      if (selectedTaskId !== null && editingTaskId === null) {
        switch (e.code) {
          case 'Space':
            e.preventDefault()
            const selectedTask = tasks.find((t) => t.id === selectedTaskId)
            if (selectedTask?.status === 'active') {
              if (selectedTask.isFocus) {
                // Toggle off - clear focus from all tasks
                // We need to add a clearFocus action or just select another task
                // For now, we'll need to handle this in the store
                useAppStore.getState().clearFocus()
              } else {
                setFocus(selectedTaskId)
              }
            }
            break
          case 'KeyD':
            e.preventDefault()
            deleteTask(selectedTaskId)
            break
          case 'KeyL':
            e.preventDefault()
            moveTask(selectedTaskId, 'later')
            break
          case 'KeyA':
            e.preventDefault()
            moveTask(selectedTaskId, 'active')
            break
          case 'KeyI':
          case 'Enter':
            e.preventDefault()
            setEditingTask(selectedTaskId)
            break
          case 'ArrowUp':
          case 'ArrowDown':
            e.preventDefault()
            const currentIdx = currentActiveTasks.findIndex(
              (t) => t.id === selectedTaskId
            )
            if (currentIdx === -1) break
            const delta = e.code === 'ArrowUp' ? -1 : 1
            const newIdx =
              (currentIdx + delta + currentActiveTasks.length) %
              currentActiveTasks.length
            setSelectedTask(currentActiveTasks[newIdx]?.id ?? null)
            break
        }
      }
    },
    [
      tasks,
      selectedTaskId,
      editingTaskId,
      isAlwaysOnTop,
      opacity,
      setSelectedTask,
      setEditingTask,
      setFocus,
      deleteTask,
      moveTask,
      undoAction,
      toggleCompactMode,
      toggleLogOverlay,
      setAlwaysOnTop,
      setOpacity,
      activeTasks,
    ]
  )

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])
}
