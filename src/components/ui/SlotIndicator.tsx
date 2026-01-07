import { cn } from '../../lib/utils'
import type { Task } from '../../types'

interface SlotIndicatorProps {
  tasks: Task[]
  maxSlots?: number
}

export function SlotIndicator({ tasks, maxSlots = 5 }: SlotIndicatorProps) {
  const focusedIndex = tasks.findIndex((t) => t.isFocus)

  return (
    <div className="slot-indicator">
      {Array.from({ length: maxSlots }).map((_, i) => (
        <span
          key={i}
          className={cn(
            'slot-dot',
            i < tasks.length && 'filled',
            i === focusedIndex && 'focused'
          )}
        />
      ))}
    </div>
  )
}
