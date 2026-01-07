import { IconButton } from '../ui/IconButton'
import { CompactIcon, PinIcon, SettingsIcon } from '../ui/Icons'
import { useAppStore } from '../../store/useAppStore'
import { cn } from '../../lib/utils'

export function Header() {
  const {
    isAlwaysOnTop,
    isCompactMode,
    setAlwaysOnTop,
    toggleCompactMode,
    toggleLogOverlay,
  } = useAppStore()

  return (
    <header className="header" data-tauri-drag-region>
      <div className="header-actions">
        <IconButton
          onClick={toggleCompactMode}
          title="Compact mode (Cmd+M)"
          className={cn(isCompactMode && 'compact-active')}
        >
          <CompactIcon />
        </IconButton>
        <IconButton
          onClick={() => setAlwaysOnTop(!isAlwaysOnTop)}
          active={isAlwaysOnTop}
          title="Pin to top (Cmd+P)"
        >
          <PinIcon />
        </IconButton>
        <IconButton onClick={toggleLogOverlay} title="Settings (Cmd+S)">
          <SettingsIcon />
        </IconButton>
      </div>
    </header>
  )
}
