import { cn } from '../../lib/utils'
import { ChevronRightIcon } from '../ui/Icons'
import { TaskList } from '../task/TaskList'
import { useAppStore } from '../../store/useAppStore'

export function LaterSection() {
  const laterTasks = useAppStore((state) => state.laterTasks())
  const isLaterExpanded = useAppStore((state) => state.isLaterExpanded)
  const toggleLaterSection = useAppStore((state) => state.toggleLaterSection)

  return (
    <section
      className={cn(
        'section later',
        isLaterExpanded ? 'expanded' : 'collapsed'
      )}
      data-status="later"
    >
      <div className="later-header" onClick={toggleLaterSection}>
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
