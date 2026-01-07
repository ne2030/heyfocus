import { cn } from '../lib/utils'
import { useAppStore } from '../store/useAppStore'

export function Toast() {
  const { toast } = useAppStore()

  return (
    <div
      className={cn(
        'toast',
        toast.visible && 'visible',
        toast.isError && 'error'
      )}
    >
      {toast.message}
    </div>
  )
}
