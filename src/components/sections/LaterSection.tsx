import { useState, useMemo, DragEvent } from 'react'
import { cn } from '../../lib/utils'
import { ChevronRightIcon } from '../ui/Icons'
import { TaskList } from '../task/TaskList'
import { useAppStore } from '../../store/useAppStore'

export function LaterSection() {
  const tasks = useAppStore((state) => state.tasks)
  const laterTasks = useMemo(
    () => tasks.filter((t) => t.status === 'later'),
    [tasks]
  )
  const isLaterExpanded = useAppStore((state) => state.isLaterExpanded)
  const toggleLaterSection = useAppStore((state) => state.toggleLaterSection)
  const draggedTaskId = useAppStore((state) => state.draggedTaskId)
  const moveTask = useAppStore((state) => state.moveTask)
  const setDraggedTask = useAppStore((state) => state.setDraggedTask)

  const [isHeaderDragOver, setIsHeaderDragOver] = useState(false)

  const handleHeaderDragOver = (e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (draggedTaskId !== null) {
      setIsHeaderDragOver(true)
      e.dataTransfer.dropEffect = 'move'
    }
  }

  const handleHeaderDragLeave = (e: DragEvent) => {
    e.preventDefault()
    setIsHeaderDragOver(false)
  }

  const handleHeaderDrop = async (e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const taskId = parseInt(e.dataTransfer.getData('text/plain'))
    if (!isNaN(taskId)) {
      await moveTask(taskId, 'later')
    }
    setIsHeaderDragOver(false)
    setDraggedTask(null)
  }

  return (
    <section
      className={cn(
        'section later',
        isLaterExpanded ? 'expanded' : 'collapsed'
      )}
      data-status="later"
    >
      <div
        className={cn('later-header', isHeaderDragOver && 'drag-over')}
        onClick={toggleLaterSection}
        onDragOver={handleHeaderDragOver}
        onDragLeave={handleHeaderDragLeave}
        onDrop={handleHeaderDrop}
      >
        <div className="later-toggle">
          <ChevronRightIcon />
          <span className="section-title">Later</span>
        </div>
        <span className="section-meta">{laterTasks.length}</span>
      </div>
      <TaskList
        tasks={laterTasks}
        status="later"
        emptyMessage="Drop tasks here for later"
      />
    </section>
  )
}
