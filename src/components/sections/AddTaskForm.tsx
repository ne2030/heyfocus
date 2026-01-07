import { useState, KeyboardEvent } from 'react'
import { useAppStore } from '../../store/useAppStore'

export function AddTaskForm() {
  const [inputValue, setInputValue] = useState('')
  const addTask = useAppStore((state) => state.addTask)

  const handleSubmit = () => {
    if (inputValue.trim()) {
      addTask(inputValue)
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
        className="add-task-input"
        placeholder="What needs your focus?"
        maxLength={100}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <button className="add-task-btn" onClick={handleSubmit}>
        Add
      </button>
    </div>
  )
}
