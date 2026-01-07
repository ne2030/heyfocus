import { SlotIndicator } from '../ui/SlotIndicator'
import { TaskList } from '../task/TaskList'
import { useAppStore } from '../../store/useAppStore'

export function ActiveSection() {
  const activeTasks = useAppStore((state) => state.activeTasks())

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
