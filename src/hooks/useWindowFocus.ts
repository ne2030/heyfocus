import { useState, useEffect } from 'react'
import { getCurrentWindow } from '@tauri-apps/api/window'

export function useWindowFocus() {
  const [isWindowFocused, setIsWindowFocused] = useState(true)

  useEffect(() => {
    const appWindow = getCurrentWindow()
    let unlistenFocus: (() => void) | undefined
    let unlistenBlur: (() => void) | undefined

    const setup = async () => {
      unlistenFocus = await appWindow.listen('tauri://focus', () => {
        setIsWindowFocused(true)
      })

      unlistenBlur = await appWindow.listen('tauri://blur', () => {
        setIsWindowFocused(false)
      })
    }

    setup()

    return () => {
      unlistenFocus?.()
      unlistenBlur?.()
    }
  }, [])

  return isWindowFocused
}
