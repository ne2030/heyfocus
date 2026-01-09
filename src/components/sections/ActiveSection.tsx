import { useMemo } from 'react'
import { SlotIndicator } from '../ui/SlotIndicator'
import { TaskList } from '../task/TaskList'
import { useAppStore } from '../../store/useAppStore'

export function ActiveSection() {
  const tasks = useAppStore((state) => state.tasks)
  const activeTasks = useMemo(
    () => tasks.filter((t) => t.status === 'active'),
    [tasks]
  )

  return (
    <section className="section">
      <div className="section-header">
        <span className="section-title">Active</span>
        <SlotIndicator tasks={activeTasks} />
      </div>
      <TaskList
        tasks={activeTasks}
        status="active"
        emptyMessage="No active tasks"
      />
    </section>
  )
}
