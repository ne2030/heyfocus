import { create } from 'zustand';
import type { Task, LogEntry, TaskStatus } from '@app/types';

// Toast type (same as actual app)
type ToastType = 'success' | 'error' | 'focus' | 'delete';

interface ToastState {
  message: string;
  type: ToastType;
  visible: boolean;
}

interface AppState {
  // Data state
  tasks: Task[];
  logs: LogEntry[];
  nextId: number;

  // UI state
  isAlwaysOnTop: boolean;
  isCompactMode: boolean;
  selectedTaskId: number | null;
  editingTaskId: number | null;
  draggedTaskId: number | null;
  isLogOverlayVisible: boolean;
  isLaterExpanded: boolean;
  opacity: number;
  toast: ToastState;

  // Computed getters
  activeTasks: () => Task[];
  laterTasks: () => Task[];
  focusedTask: () => Task | undefined;

  // Data actions (all no-op for Remotion)
  loadData: () => Promise<void>;
  addTask: (text: string) => Promise<void>;
  moveTask: (id: number, newStatus: TaskStatus) => Promise<void>;
  setFocus: (id: number) => Promise<void>;
  clearFocus: () => Promise<void>;
  completeTask: (id: number) => Promise<void>;
  deleteTask: (id: number) => Promise<void>;
  editTask: (id: number, text: string) => Promise<void>;
  undoAction: () => Promise<void>;
  clearLogs: () => Promise<void>;

  // UI actions (no-op for Remotion, state is controlled externally)
  setAlwaysOnTop: (enabled: boolean) => Promise<void>;
  toggleCompactMode: () => void;
  setSelectedTask: (id: number | null) => void;
  setEditingTask: (id: number | null) => void;
  setDraggedTask: (id: number | null) => void;
  toggleLogOverlay: () => void;
  toggleLaterSection: () => void;
  setOpacity: (value: number) => void;
  showToast: (message: string, type?: ToastType) => void;
  hideToast: () => void;
  syncState: (data: any) => void;

  // Remotion-specific: Set state from sequence
  _setMockState: (state: Partial<AppState>) => void;
}

// No-op async function
const noop = async () => {};

// Create the mock store
export const useAppStore = create<AppState>((set, get) => ({
  // Initial state
  tasks: [],
  logs: [],
  nextId: 0,
  isAlwaysOnTop: false,
  isCompactMode: false,
  selectedTaskId: null,
  editingTaskId: null,
  draggedTaskId: null,
  isLogOverlayVisible: false,
  isLaterExpanded: false,
  opacity: 100,
  toast: { message: '', type: 'success', visible: false },

  // Computed getters
  activeTasks: () => get().tasks.filter((t) => t.status === 'active'),
  laterTasks: () => get().tasks.filter((t) => t.status === 'later'),
  focusedTask: () => get().tasks.find((t) => t.isFocus),

  // All actions are no-op in Remotion (state is set via _setMockState)
  loadData: noop,
  addTask: noop,
  moveTask: noop,
  setFocus: noop,
  clearFocus: noop,
  completeTask: noop,
  deleteTask: noop,
  editTask: noop,
  undoAction: noop,
  clearLogs: noop,
  setAlwaysOnTop: noop,
  toggleCompactMode: () => {},
  setSelectedTask: () => {},
  setEditingTask: () => {},
  setDraggedTask: (id) => set({ draggedTaskId: id }),
  toggleLogOverlay: () => {},
  toggleLaterSection: () => {},
  setOpacity: () => {},
  showToast: () => {},
  hideToast: () => {},
  syncState: () => {},

  // Remotion-specific: Update store state for animation frames
  _setMockState: (newState) => set(newState),
}));

// Mock state input type
interface MockStateInput {
  tasks?: Task[];
  logs?: LogEntry[];
  isAlwaysOnTop?: boolean;
  isCompactMode?: boolean;
  selectedTaskId?: number | null;
  editingTaskId?: number | null;
  draggedTaskId?: number | null;
  isLogOverlayVisible?: boolean;
  isLaterExpanded?: boolean;
  opacity?: number;
}

// Module-level state tracking to prevent duplicate updates
let lastStateKey: string | null = null;

/**
 * Set mock state for Remotion sequences.
 * This is a regular function (not a hook) that safely updates Zustand state.
 * Zustand stores can be updated outside of React's render cycle.
 */
export function setMockState(state: MockStateInput): void {
  const stateKey = JSON.stringify(state);

  // Skip if state hasn't changed
  if (stateKey === lastStateKey) {
    return;
  }

  lastStateKey = stateKey;
  useAppStore.setState(state);
}

// Re-export types
export type { Task, LogEntry, TaskStatus, ToastType };
