import { cn } from '../lib/utils'
import { useAppStore } from '../store/useAppStore'

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="toast-icon">
      <path
        d="M11.5 4L5.5 10L2.5 7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function XIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="toast-icon">
      <path
        d="M10.5 3.5L3.5 10.5M3.5 3.5L10.5 10.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

function FocusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="toast-icon">
      <circle cx="7" cy="7" r="2.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M7 1V3M7 11V13M1 7H3M11 7H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="toast-icon">
      <path
        d="M2.5 4H11.5M5.5 4V2.5H8.5V4M4 4L4.5 11.5H9.5L10 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

const iconMap = {
  success: CheckIcon,
  error: XIcon,
  focus: FocusIcon,
  delete: TrashIcon,
}

export function Toast() {
  const { toast } = useAppStore()
  const Icon = iconMap[toast.type]

  return (
    <div
      className={cn(
        'toast',
        toast.visible && 'visible',
        `toast-${toast.type}`
      )}
    >
      <span className="toast-icon-wrapper">
        <Icon />
      </span>
      <span className="toast-message">{toast.message}</span>
    </div>
  )
}
