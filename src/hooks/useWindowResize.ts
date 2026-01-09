import { useEffect, useRef, useCallback, RefObject } from 'react'
import { tauriApi } from '../lib/tauri'
import { useAppStore } from '../store/useAppStore'

const BASE_WIDTH = 320

export function useWindowResize(mainRef: RefObject<HTMLElement | null>) {
  const { isCompactMode, isLaterExpanded, tasks, scaleFactor } = useAppStore()
  const resizeTimeoutRef = useRef<number>()
  const rafIdRef = useRef<number | null>(null)
  const prevLaterExpanded = useRef(isLaterExpanded)
  const prevCompactMode = useRef(isCompactMode)

  const updateWindowSize = useCallback(async () => {
    if (!mainRef.current) return

    const header = document.querySelector('.header')
    const headerHeight = header?.getBoundingClientRect().height ?? 44

    const mainStyle = getComputedStyle(mainRef.current)
    const mainPaddingTop = parseFloat(mainStyle.paddingTop)
    const mainPaddingBottom = parseFloat(mainStyle.paddingBottom)

    let totalHeight: number

    if (isCompactMode) {
      const taskList = document.getElementById('activeList') ||
                       document.querySelector('.section .task-list')
      const taskListHeight = taskList?.getBoundingClientRect().height ?? 0
      totalHeight = Math.max(
        100,
        headerHeight + mainPaddingTop + taskListHeight + mainPaddingBottom
      )
    } else {
      // Temporarily disable flex to measure natural height
      mainRef.current.style.flex = '0 0 auto'
      void mainRef.current.offsetHeight // Force reflow
      const contentHeight = mainRef.current.scrollHeight
      mainRef.current.style.flex = ''

      totalHeight = Math.max(
        150,
        Math.min(800, headerHeight + contentHeight)
      )
    }

    try {
      await tauriApi.setWindowSize(BASE_WIDTH * scaleFactor, totalHeight)
    } catch (error) {
      // Silently fail - might not be in Tauri context
    }
  }, [mainRef, isCompactMode, scaleFactor])

  // Start rAF loop for smooth transition tracking
  const startRafLoop = useCallback(() => {
    const tick = () => {
      updateWindowSize()
      rafIdRef.current = requestAnimationFrame(tick)
    }
    rafIdRef.current = requestAnimationFrame(tick)
  }, [updateWindowSize])

  // Stop rAF loop
  const stopRafLoop = useCallback(() => {
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current)
      rafIdRef.current = null
    }
  }, [])

  // Handle compact mode transition - update immediately in same frame
  useEffect(() => {
    const compactToggled = prevCompactMode.current !== isCompactMode
    prevCompactMode.current = isCompactMode

    let rafId: number | null = null

    if (compactToggled) {
      // Use rAF to ensure window size update happens in the same frame as CSS change
      rafId = requestAnimationFrame(() => {
        updateWindowSize()
      })
    }

    return () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId)
      }
    }
  }, [isCompactMode, updateWindowSize])

  // Handle Later section transition
  useEffect(() => {
    const laterToggled = prevLaterExpanded.current !== isLaterExpanded
    prevLaterExpanded.current = isLaterExpanded

    if (laterToggled) {
      // Start rAF loop when Later section toggles
      startRafLoop()

      // Listen for transition end to stop the loop
      const taskList = document.querySelector('.section.later .task-list')

      const handleTransitionEnd = (e: Event) => {
        const transitionEvent = e as TransitionEvent
        if (transitionEvent.propertyName === 'max-height') {
          stopRafLoop()
          updateWindowSize() // Final update
          taskList?.removeEventListener('transitionend', handleTransitionEnd)
        }
      }

      taskList?.addEventListener('transitionend', handleTransitionEnd)

      // Fallback: stop after 300ms if transitionend doesn't fire
      const fallbackTimeout = setTimeout(() => {
        stopRafLoop()
        updateWindowSize()
      }, 300)

      return () => {
        stopRafLoop()
        clearTimeout(fallbackTimeout)
        taskList?.removeEventListener('transitionend', handleTransitionEnd)
      }
    }
  }, [isLaterExpanded, startRafLoop, stopRafLoop, updateWindowSize])

  // Handle other changes with debounce
  useEffect(() => {
    const debouncedUpdate = () => {
      clearTimeout(resizeTimeoutRef.current)
      resizeTimeoutRef.current = window.setTimeout(updateWindowSize, 100)
    }

    // Initial resize
    debouncedUpdate()

    // Observe DOM changes
    const observer = new MutationObserver(debouncedUpdate)
    if (mainRef.current) {
      observer.observe(mainRef.current, { childList: true, subtree: true })
    }

    // Also update when window resizes
    window.addEventListener('resize', debouncedUpdate)

    return () => {
      observer.disconnect()
      clearTimeout(resizeTimeoutRef.current)
      window.removeEventListener('resize', debouncedUpdate)
    }
  }, [isCompactMode, tasks.length, mainRef, updateWindowSize])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopRafLoop()
    }
  }, [stopRafLoop])
}
