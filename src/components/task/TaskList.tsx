import { DragEvent, useState } from 'react'
import { cn } from '../../lib/utils'
import { TaskItem } from './TaskItem'
import { useAppStore } from '../../store/useAppStore'
import type { Task, TaskStatus } from '../../types'

interface TaskListProps {
  tasks: Task[]
  status: TaskStatus
  emptyMessage: string
}

export function TaskList({ tasks, status, emptyMessage }: TaskListProps) {
  const { draggedTaskId, setDraggedTask, moveTask, activeTasks } = useAppStore()
  const [isDragOver, setIsDragOver] = useState(false)
  const [isInvalid, setIsInvalid] = useState(false)

  const handleDragStart = (e: DragEvent, taskId: number) => {
    setDraggedTask(taskId)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', taskId.toString())
  }

  const handleDragEnd = () => {
    setDraggedTask(null)
    setIsDragOver(false)
    setIsInvalid(false)
  }

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (draggedTaskId === null) return

    // Check if moving to active would exceed limit
    if (status === 'active') {
      const currentActive = activeTasks()
      const draggedTask = useAppStore.getState().tasks.find((t) => t.id === draggedTaskId)

      if (draggedTask?.status !== 'active' && currentActive.length >= 5) {
        setIsInvalid(true)
        e.dataTransfer.dropEffect = 'none'
        setIsDragOver(true)
        return
      }
    }

    setIsInvalid(false)
    setIsDragOver(true)
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDragLeave = (e: DragEvent) => {
    // Only handle if leaving the container (not entering a child)
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const { clientX, clientY } = e
    if (
      clientX < rect.left ||
      clientX > rect.right ||
      clientY < rect.top ||
      clientY > rect.bottom
    ) {
      setIsDragOver(false)
      setIsInvalid(false)
    }
  }

  const handleDrop = async (e: DragEvent) => {
    e.preventDefault()
    const taskId = parseInt(e.dataTransfer.getData('text/plain'))

    if (!isNaN(taskId) && !isInvalid) {
      await moveTask(taskId, status)
    }

    setIsDragOver(false)
    setIsInvalid(false)
    setDraggedTask(null)
  }

  return (
    <div
      className={cn(
        'task-list',
        isDragOver && 'drag-over',
        isDragOver && isInvalid && 'invalid'
      )}
      data-status={status}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {tasks.length === 0 ? (
        <div className="task-list-empty">{emptyMessage}</div>
      ) : (
        tasks.map((task, index) => (
          <TaskItem
            key={task.id}
            task={task}
            index={index}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          />
        ))
      )}
    </div>
  )
}
