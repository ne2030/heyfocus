import { useState, KeyboardEvent } from 'react'
import { cn } from '../../lib/utils'
import { useAppStore } from '../../store/useAppStore'

interface AddTaskFormProps {
  // Controlled mode props (for Remotion)
  value?: string
  isFocused?: boolean
}

export function AddTaskForm({ value, isFocused }: AddTaskFormProps = {}) {
  const [inputValue, setInputValue] = useState('')
  const addTask = useAppStore((state) => state.addTask)

  // Use controlled value if provided, otherwise use internal state
  const displayValue = value !== undefined ? value : inputValue
  const isControlled = value !== undefined

  const handleSubmit = () => {
    if (displayValue.trim() && !isControlled) {
      addTask(displayValue)
      setInputValue('')
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit()
    }
  }

  return (
    <div className="add-task">
      <input
        type="text"
        className={cn('add-task-input', isFocused && 'focused')}
        placeholder="What needs your focus?"
        maxLength={100}
        value={displayValue}
        onChange={(e) => !isControlled && setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        readOnly={isControlled}
      />
      <button className="add-task-btn" onClick={handleSubmit}>
        Add
      </button>
    </div>
  )
}
