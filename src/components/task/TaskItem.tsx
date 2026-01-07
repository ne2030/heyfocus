import { useState, useRef, useEffect, KeyboardEvent, DragEvent } from 'react'
import { cn } from '../../lib/utils'
import { CheckIcon, TrashIcon } from '../ui/Icons'
import { useAppStore } from '../../store/useAppStore'
import type { Task } from '../../types'

interface TaskItemProps {
  task: Task
  index: number
  onDragStart: (e: DragEvent, id: number) => void
  onDragEnd: () => void
}

export function TaskItem({ task, index, onDragStart, onDragEnd }: TaskItemProps) {
  const {
    selectedTaskId,
    editingTaskId,
    draggedTaskId,
    setEditingTask,
    setFocus,
    completeTask,
    deleteTask,
    editTask,
  } = useAppStore()

  const [editText, setEditText] = useState(task.text)
  const [isHovered, setIsHovered] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const isSelected = selectedTaskId === task.id
  const isEditing = editingTaskId === task.id
  const isDragging = draggedTaskId === task.id
  const isAnyDragging = draggedTaskId !== null

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  useEffect(() => {
    setEditText(task.text)
  }, [task.text])

  const handleIndicatorClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (task.status === 'active') {
      setFocus(task.id)
    }
  }

  const handleDoubleClick = () => {
    setEditingTask(task.id)
  }

  const handleEditKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      editTask(task.id, editText)
    } else if (e.key === 'Escape') {
      setEditText(task.text)
      setEditingTask(null)
    }
  }

  const handleEditBlur = () => {
    if (editText.trim() && editText !== task.text) {
      editTask(task.id, editText)
    } else {
      setEditText(task.text)
      setEditingTask(null)
    }
  }

  const handleDragStart = (e: DragEvent<HTMLDivElement>) => {
    onDragStart(e, task.id)
  }

  return (
    <div
      className={cn(
        'task-item',
        task.isFocus && 'focused',
        isSelected && 'selected',
        isDragging && 'dragging',
        isEditing && 'editing',
        isHovered && !isAnyDragging && 'hovered'
      )}
      data-id={task.id}
      data-index={index}
      draggable={!isEditing}
      onDragStart={handleDragStart}
      onDragEnd={() => {
        setIsHovered(false)
        onDragEnd()
      }}
      onMouseEnter={() => !isAnyDragging && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => {
        if (task.status === 'active') {
          setFocus(task.id)
        }
      }}
      onDoubleClick={handleDoubleClick}
    >
      <div className="task-indicator" onClick={handleIndicatorClick} />

      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          className="task-edit-input"
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          onKeyDown={handleEditKeyDown}
          onBlur={handleEditBlur}
          maxLength={100}
        />
      ) : (
        <span className="task-text">{task.text}</span>
      )}

      {!isEditing && (
        <div className="task-actions">
          <button
            className="task-btn complete"
            onClick={(e) => {
              e.stopPropagation()
              completeTask(task.id)
            }}
            title="Complete"
          >
            <CheckIcon />
          </button>
          <button
            className="task-btn delete"
            onClick={(e) => {
              e.stopPropagation()
              deleteTask(task.id)
            }}
            title="Delete"
          >
            <TrashIcon />
          </button>
        </div>
      )}
    </div>
  )
}
