import { useEffect, useRef, RefObject } from 'react'
import { tauriApi } from '../lib/tauri'
import { useAppStore } from '../store/useAppStore'

export function useWindowResize(mainRef: RefObject<HTMLElement | null>) {
  const { isCompactMode, isLaterExpanded, tasks } = useAppStore()
  const resizeTimeoutRef = useRef<number>()

  useEffect(() => {
    const updateWindowSize = async () => {
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
          Math.min(600, headerHeight + contentHeight + mainPaddingTop + mainPaddingBottom)
        )
      }

      try {
        await tauriApi.setWindowSize(320, totalHeight)
      } catch (error) {
        // Silently fail - might not be in Tauri context
      }
    }

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
  }, [isCompactMode, isLaterExpanded, tasks.length, mainRef])
}
