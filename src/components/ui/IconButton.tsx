import { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '../../lib/utils'

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean
  children: ReactNode
}

export function IconButton({ active, className, children, ...props }: IconButtonProps) {
  return (
    <button className={cn('icon-btn', active && 'active', className)} {...props}>
      {children}
    </button>
  )
}
