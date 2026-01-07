// HeyFocus - Main Application Logic

const { invoke } = window.__TAURI__.core;

// BroadcastChannel for cross-window communication
const settingsChannel = new BroadcastChannel('heyfocus-settings');

// State
let appData = { tasks: [], logs: [], next_id: 0 };
let isAlwaysOnTop = false;
let draggedTaskId = null;
let selectedTaskId = null; // Track keyboard-selected task
let isCompactMode = false;
let editingTaskId = null;

// DOM Elements
const activeList = document.getElementById('activeList');
const laterList = document.getElementById('laterList');
const activeSlots = document.getElementById('activeSlots');
const laterCount = document.getElementById('laterCount');
const laterSection = document.getElementById('laterSection');
const laterHeader = document.getElementById('laterHeader');
const taskInput = document.getElementById('taskInput');
const addTaskBtn = document.getElementById('addTaskBtn');
const pinBtn = document.getElementById('pinBtn');
const logBtn = document.getElementById('logBtn');
const logOverlay = document.getElementById('logOverlay');
const opacitySlider = document.getElementById('opacitySlider');
const appContainer = document.querySelector('.app');
const closeLogBtn = document.getElementById('closeLogBtn');
const logContent = document.getElementById('logContent');
const statCompleted = document.getElementById('statCompleted');
const statSwitches = document.getElementById('statSwitches');
const statTotal = document.getElementById('statTotal');
const toast = document.getElementById('toast');
const opacityValue = document.getElementById('opacityValue');
const compactBtn = document.getElementById('compactBtn');

// Check if this is the log window
const isLogWindow = window.location.hash === '#log';

// Initialize app
async function init() {
  try {
    appData = await invoke('load_data');

    if (isLogWindow) {
      // Settings window mode
      initLogWindow();
    } else {
      // Main window mode
      render();
      setupEventListeners();
      setupResizeObserver();

      // Listen for opacity changes from settings window
      settingsChannel.onmessage = (e) => {
        if (e.data.type === 'opacity') {
          const value = e.data.value;
          document.documentElement.style.setProperty('--bg-alpha', value / 100);
          opacitySlider.value = value;
          opacityValue.textContent = value + '%';
        }
      };
    }
  } catch (error) {
    console.error('Failed to initialize:', error);
    showToast('Failed to load data', true);
  }
}

// Initialize log window (separate window)
function initLogWindow() {
  const app = document.querySelector('.app');

  app.innerHTML = `
    <div class="settings-window">
      <section class="settings-section activity-section" style="padding-top: 16px;">
        <div class="activity-header">
          <div class="activity-stats">
            <span class="stat-pill"><span class="stat-num" id="logStatCompleted">0</span> done</span>
            <span class="stat-pill"><span class="stat-num" id="logStatSwitches">0</span> switches</span>
            <span class="stat-pill"><span class="stat-num" id="logStatTotal">0</span> events</span>
          </div>
        </div>
        <div class="activity-log" id="activityLog"></div>
      </section>

      <div class="esc-hint">
        <kbd>ESC</kbd> to close
      </div>
    </div>
  `;

  // Render logs
  renderSettingsLogs();

  // ESC to close window (use e.code for language-independent handling)
  document.addEventListener('keydown', (e) => {
    if (e.code === 'Escape' || e.key === 'Escape') {
      window.close();
    }
  });

  // Refresh logs periodically
  setInterval(async () => {
    try {
      appData = await invoke('load_data');
      renderSettingsLogs();
    } catch (e) {
      console.error('Failed to refresh logs:', e);
    }
  }, 2000);
}

function renderSettingsLogs() {
  const logs = appData.logs;
  const content = document.getElementById('activityLog');
  const statCompleted = document.getElementById('logStatCompleted');
  const statSwitches = document.getElementById('logStatSwitches');
  const statTotal = document.getElementById('logStatTotal');

  if (!content) return;

  // Update stats
  const completed = logs.filter(l => l.event === 'TASK_DONE').length;
  const switches = logs.filter(l => l.event === 'SWITCH_FOCUS').length;

  statCompleted.textContent = completed;
  statSwitches.textContent = switches;
  if (statTotal) statTotal.textContent = logs.length;

  // Render log entries (newest first)
  const reversedLogs = [...logs].reverse();
  content.innerHTML = reversedLogs.length > 0
    ? reversedLogs.map(log => `
        <div class="log-row">
          <span class="log-time">${formatTimeShort(log.time)}</span>
          <span class="log-type ${log.event}">${formatEventShort(log.event)}</span>
          <span class="log-text">${escapeHTML(log.task)}</span>
        </div>
      `).join('')
    : '<div class="log-empty">No activity yet</div>';
}

function formatTimeShort(timeStr) {
  if (!timeStr) return '--:--';
  const date = new Date(timeStr);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
}

function formatEventShort(event) {
  const map = {
    'TASK_DONE': 'DONE',
    'SWITCH_FOCUS': 'SWITCH',
    'TASK_ADDED': 'ADD',
    'TASK_DELETED': 'DEL',
    'MOVE_TO_LATER': 'LATER',
    'MOVE_TO_ACTIVE': 'ACTIVE'
  };
  return map[event] || event;
}

// Render the UI
function render() {
  renderTasks();
  renderSlots();
  renderLaterCount();
  renderLogs();
  updateSelectionUI();
}

function renderTasks() {
  const activeTasks = appData.tasks.filter(t => t.status === 'active');
  const laterTasks = appData.tasks.filter(t => t.status === 'later');

  activeList.innerHTML = activeTasks.length === 0
    ? '<div class="task-list-empty">No active tasks</div>'
    : activeTasks.map(task => createTaskHTML(task, true)).join('');

  laterList.innerHTML = laterTasks.length === 0
    ? '<div class="task-list-empty">Drop tasks here for later</div>'
    : laterTasks.map(task => createTaskHTML(task, false)).join('');
}

function createTaskHTML(task, isActive) {
  const focusedClass = task.isFocus ? 'focused' : '';
  const editingClass = editingTaskId === task.id ? 'editing' : '';

  return `
    <div class="task-item ${focusedClass} ${editingClass}" draggable="true" data-id="${task.id}">
      ${isActive ? '<div class="task-indicator"></div>' : ''}
      <span class="task-text">${escapeHTML(task.text)}</span>
      <input class="task-edit-input" type="text" value="${escapeHTML(task.text)}" maxlength="100">
      <div class="task-actions">
        <button class="task-btn complete" data-action="complete" title="Complete">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 6 9 17l-5-5"/>
          </svg>
        </button>
        <button class="task-btn delete" data-action="delete" title="Delete">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 6 6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>
    </div>
  `;
}

function renderSlots() {
  const activeTasks = appData.tasks.filter(t => t.status === 'active');
  const slots = activeSlots.querySelectorAll('.slot-dot');

  slots.forEach((slot, i) => {
    slot.classList.remove('filled', 'focused');
    if (i < activeTasks.length) {
      slot.classList.add('filled');
      if (activeTasks[i].isFocus) {
        slot.classList.add('focused');
      }
    }
  });
}

function renderLaterCount() {
  const count = appData.tasks.filter(t => t.status === 'later').length;
  laterCount.textContent = count;
}

function renderLogs() {
  const logs = appData.logs;

  // Update stats
  const completed = logs.filter(l => l.event === 'TASK_DONE').length;
  const switches = logs.filter(l => l.event === 'SWITCH_FOCUS').length;

  statCompleted.textContent = completed;
  statSwitches.textContent = switches;
  statTotal.textContent = logs.length;

  // Render log entries (newest first)
  if (logs.length === 0) {
    logContent.innerHTML = '<div class="log-empty">No activity yet</div>';
    return;
  }

  const reversedLogs = [...logs].reverse();
  logContent.innerHTML = reversedLogs.map(log => `
    <div class="log-entry">
      <span class="log-time">${formatTime(log.time)}</span>
      <span class="log-event ${log.event}">${formatEvent(log.event)}</span>
      <span class="log-task">${escapeHTML(log.task)}</span>
    </div>
  `).join('');
}

// Event Listeners
function setupEventListeners() {
  // Add task
  addTaskBtn.addEventListener('click', addTask);
  taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addTask();
  });

  // Task actions (delegation)
  activeList.addEventListener('click', handleTaskAction);
  laterList.addEventListener('click', handleTaskAction);

  // Double-click to edit
  activeList.addEventListener('dblclick', handleDoubleClick);
  laterList.addEventListener('dblclick', handleDoubleClick);

  // Click on active task indicator to focus
  activeList.addEventListener('click', handleFocusClick);

  // Drag and drop on lists (including laterSection for collapsed state)
  [activeList, laterList, laterSection].forEach(target => {
    target.addEventListener('dragover', handleDragOver);
    target.addEventListener('dragleave', handleDragLeave);
    target.addEventListener('drop', handleDrop);
  });

  // Drag events on task items (event delegation)
  setupDragListeners();

  // Later section toggle
  laterHeader.addEventListener('click', toggleLaterSection);

  // Pin button
  pinBtn.addEventListener('click', toggleAlwaysOnTop);

  // Compact mode button
  compactBtn.addEventListener('click', toggleCompactMode);

  // Keyboard shortcuts
  document.addEventListener('keydown', handleKeyboardShortcuts);

  // Clear selection when clicking elsewhere
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.task-item') && !e.target.closest('.task-btn')) {
      selectedTaskId = null;
      updateSelectionUI();
    }
  });

  // Opacity slider
  opacitySlider.addEventListener('input', handleOpacityChange);

  // Restore saved opacity
  const savedOpacity = localStorage.getItem('heyfocus_opacity');
  if (savedOpacity) {
    opacitySlider.value = savedOpacity;
    opacityValue.textContent = savedOpacity + '%';
    document.documentElement.style.setProperty('--bg-alpha', savedOpacity / 100);
  }

  // Settings panel (bottom sheet)
  logBtn.addEventListener('click', () => {
    logOverlay.classList.add('visible');
  });

  closeLogBtn.addEventListener('click', () => {
    logOverlay.classList.remove('visible');
  });

  logOverlay.addEventListener('click', (e) => {
    if (e.target === logOverlay) {
      logOverlay.classList.remove('visible');
    }
  });

  // Open log window button (inside settings panel)
  const openLogWindowBtn = document.getElementById('openLogWindowBtn');
  if (openLogWindowBtn) {
    openLogWindowBtn.addEventListener('click', async () => {
      try {
        await invoke('open_log_window');
      } catch (error) {
        console.error('Failed to open log window:', error);
      }
    });
  }
}

function setupDragListeners() {
  // Use event delegation for drag events
  document.addEventListener('dragstart', (e) => {
    const taskItem = e.target.closest('.task-item');
    if (taskItem) handleDragStart(e);
  });

  document.addEventListener('dragend', (e) => {
    const taskItem = e.target.closest('.task-item');
    if (taskItem) handleDragEnd(e);
  });
}

async function addTask() {
  const text = taskInput.value.trim();
  if (!text) return;

  const activeTasks = appData.tasks.filter(t => t.status === 'active');
  const status = activeTasks.length < 5 ? 'active' : 'later';

  try {
    appData = await invoke('add_task', { text, status });
    taskInput.value = '';
    render();

    if (status === 'later') {
      showToast('Active full → added to Later');
    }
  } catch (error) {
    showToast(error, true);
  }
}

async function handleTaskAction(e) {
  const btn = e.target.closest('.task-btn');
  if (!btn) return;

  e.stopPropagation();

  const taskItem = btn.closest('.task-item');
  const taskId = parseInt(taskItem.dataset.id);
  const action = btn.dataset.action;

  try {
    if (action === 'complete') {
      appData = await invoke('complete_task', { id: taskId });
      showToast('Done!');
    } else if (action === 'delete') {
      appData = await invoke('delete_task', { id: taskId });
    }
    render();
  } catch (error) {
    showToast(error, true);
  }
}

async function setFocusOnTask(taskId) {
  const task = appData.tasks.find(t => t.id === taskId);
  if (!task || task.status !== 'active' || task.isFocus) return;

  try {
    appData = await invoke('set_focus', { id: taskId });
    render();
  } catch (error) {
    showToast(error, true);
  }
}

async function handleFocusClick(e) {
  // Skip if editing mode is active
  if (editingTaskId !== null) return;

  const taskItem = e.target.closest('.task-item');
  if (!taskItem) return;

  // Only respond to indicator clicks or task-item clicks (not action buttons)
  if (e.target.closest('.task-btn') || e.target.closest('.task-actions')) return;

  const taskId = parseInt(taskItem.dataset.id);
  await setFocusOnTask(taskId);
}

// Drag and Drop
function handleDragStart(e) {
  const taskItem = e.target.closest('.task-item');
  if (!taskItem) return;

  draggedTaskId = parseInt(taskItem.dataset.id);
  taskItem.classList.add('dragging');

  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/plain', draggedTaskId.toString());

  // Create a subtle drag image
  const dragImage = taskItem.cloneNode(true);
  dragImage.style.opacity = '0.8';
  dragImage.style.position = 'absolute';
  dragImage.style.top = '-1000px';
  document.body.appendChild(dragImage);
  e.dataTransfer.setDragImage(dragImage, 0, 0);

  setTimeout(() => document.body.removeChild(dragImage), 0);
}

function handleDragEnd(e) {
  const taskItem = e.target.closest('.task-item');
  if (taskItem) {
    taskItem.classList.remove('dragging');
  }
  draggedTaskId = null;

  document.querySelectorAll('.task-list').forEach(list => {
    list.classList.remove('drag-over', 'invalid');
  });
}

function handleDragOver(e) {
  e.preventDefault();
  e.stopPropagation();

  const target = e.currentTarget;
  const targetStatus = target.dataset.status;

  // Check if dropping to active would exceed limit
  if (targetStatus === 'active' && draggedTaskId !== null) {
    const activeTasks = appData.tasks.filter(t => t.status === 'active');
    const draggedTask = appData.tasks.find(t => t.id === draggedTaskId);

    if (draggedTask && draggedTask.status !== 'active' && activeTasks.length >= 5) {
      target.classList.add('drag-over', 'invalid');
      e.dataTransfer.dropEffect = 'none';
      return;
    }
  }

  target.classList.add('drag-over');
  target.classList.remove('invalid');
  e.dataTransfer.dropEffect = 'move';
}

function handleDragLeave(e) {
  const target = e.currentTarget;
  const relatedTarget = e.relatedTarget;

  // Only remove drag-over if we're actually leaving the target
  if (!target.contains(relatedTarget)) {
    target.classList.remove('drag-over', 'invalid');
  }
}

async function handleDrop(e) {
  e.preventDefault();
  e.stopPropagation();

  const target = e.currentTarget;
  target.classList.remove('drag-over', 'invalid');

  // Also remove from laterSection if dropping on laterList
  laterSection.classList.remove('drag-over', 'invalid');

  const newStatus = target.dataset.status;
  const taskId = parseInt(e.dataTransfer.getData('text/plain'));

  if (isNaN(taskId)) return;

  const task = appData.tasks.find(t => t.id === taskId);

  if (!task || task.status === newStatus) return;

  try {
    appData = await invoke('move_task', { id: taskId, newStatus });
    render();

    // Auto-expand Later section when dropping items there
    if (newStatus === 'later') {
      laterSection.classList.remove('collapsed');
      laterSection.classList.add('expanded');
    }
  } catch (error) {
    showToast(error, true);
  }
}

function handleOpacityChange(e) {
  const value = e.target.value;
  const alpha = value / 100;
  document.documentElement.style.setProperty('--bg-alpha', alpha);
  opacityValue.textContent = value + '%';
  localStorage.setItem('heyfocus_opacity', value);
}

function adjustOpacity(delta) {
  const current = parseInt(opacitySlider.value);
  const newValue = Math.max(30, Math.min(100, current + delta));
  opacitySlider.value = newValue;
  handleOpacityChange({ target: opacitySlider });
}

function toggleCompactMode() {
  isCompactMode = !isCompactMode;
  appContainer.classList.toggle('compact', isCompactMode);
  compactBtn.classList.toggle('compact-active', isCompactMode);

  // Let ResizeObserver handle window sizing automatically
  setTimeout(updateWindowSize, 50);
}

// Inline Editing
function handleDoubleClick(e) {
  const taskItem = e.target.closest('.task-item');
  if (!taskItem) return;
  if (e.target.closest('.task-btn') || e.target.closest('.task-actions')) return;

  const taskId = parseInt(taskItem.dataset.id);
  startEditTask(taskId);
}

function startEditTask(taskId) {
  if (editingTaskId !== null) {
    saveEditTask();
  }

  editingTaskId = taskId;
  render();

  // Focus the input after render
  setTimeout(() => {
    const input = document.querySelector(`.task-item[data-id="${taskId}"] .task-edit-input`);
    if (input) {
      input.focus();
      input.select();
      setupEditInputListeners(input, taskId);
    }
  }, 0);
}

function setupEditInputListeners(input, taskId) {
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveEditTask();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      cancelEditTask();
    }
  });

  input.addEventListener('blur', () => {
    // Small delay to check if we're clicking elsewhere
    setTimeout(() => {
      if (editingTaskId === taskId) {
        saveEditTask();
      }
    }, 100);
  });
}

async function saveEditTask() {
  if (editingTaskId === null) return;

  const input = document.querySelector(`.task-item[data-id="${editingTaskId}"] .task-edit-input`);
  if (!input) {
    editingTaskId = null;
    render();
    return;
  }

  const newText = input.value.trim();
  if (newText) {
    try {
      appData = await invoke('edit_task', { id: editingTaskId, text: newText });
    } catch (error) {
      showToast(error, true);
    }
  }

  editingTaskId = null;
  render();
}

function cancelEditTask() {
  editingTaskId = null;
  render();
}

async function toggleLaterSection() {
  const isExpanding = laterSection.classList.contains('collapsed');

  if (isExpanding) {
    // Expand: temporarily set window to max height, then adjust after animation
    await invoke('set_window_size', { width: 320, height: 600 });
  }

  laterSection.classList.toggle('collapsed');
  laterSection.classList.toggle('expanded');

  // After animation completes, calculate exact height
  setTimeout(updateWindowSize, 250);
}

// Keyboard Shortcuts (using e.code for language-independent handling)
function handleKeyboardShortcuts(e) {
  const activeTasks = appData.tasks.filter(t => t.status === 'active');

  // Ignore if typing in input
  if (document.activeElement === taskInput) {
    if (e.code === 'Escape') {
      taskInput.blur();
    }
    return;
  }

  // Cmd/Ctrl shortcuts (use e.code for language-independent keys)
  if (e.metaKey || e.ctrlKey) {
    switch (e.code) {
      case 'KeyP':
        e.preventDefault();
        toggleAlwaysOnTop();
        break;
      case 'KeyN':
        e.preventDefault();
        taskInput.focus();
        break;
      case 'KeyS':
        e.preventDefault();
        toggleLogPanel();
        break;
      case 'KeyZ':
        e.preventDefault();
        undoAction();
        break;
      case 'BracketLeft':
        e.preventDefault();
        adjustOpacity(-5);
        break;
      case 'BracketRight':
        e.preventDefault();
        adjustOpacity(5);
        break;
      case 'KeyM':
        e.preventDefault();
        toggleCompactMode();
        break;
      case 'Digit1':
      case 'Digit2':
      case 'Digit3':
      case 'Digit4':
      case 'Digit5':
        e.preventDefault();
        if (editingTaskId !== null) {
          saveEditTask();
        }
        selectTaskByIndex(parseInt(e.code.charAt(5)) - 1);
        break;
    }
    return;
  }

  // Non-Cmd shortcuts (only when a task is selected)
  if (selectedTaskId !== null && editingTaskId === null) {
    switch (e.code) {
      case 'Space':
        e.preventDefault();
        toggleFocusOnSelected();
        break;
      case 'KeyD':
        e.preventDefault();
        deleteSelectedTask();
        break;
      case 'KeyL':
        e.preventDefault();
        moveSelectedToLater();
        break;
      case 'KeyI':
        e.preventDefault();
        startEditTask(selectedTaskId);
        break;
      case 'ArrowUp':
        e.preventDefault();
        moveSelection(-1);
        break;
      case 'ArrowDown':
        e.preventDefault();
        moveSelection(1);
        break;
      case 'Escape':
        e.preventDefault();
        clearSelection();
        break;
    }
  } else {
    // Arrow keys without selection - start selection
    if (e.code === 'ArrowUp' || e.code === 'ArrowDown') {
      e.preventDefault();
      if (activeTasks.length > 0) {
        selectTaskByIndex(0);
      }
    }
  }
}

function selectTaskByIndex(index) {
  const activeTasks = appData.tasks.filter(t => t.status === 'active');
  if (index >= 0 && index < activeTasks.length) {
    selectedTaskId = activeTasks[index].id;
    updateSelectionUI();
  }
}

function moveSelection(direction) {
  const activeTasks = appData.tasks.filter(t => t.status === 'active');
  if (activeTasks.length === 0) return;

  const currentIndex = activeTasks.findIndex(t => t.id === selectedTaskId);
  let newIndex;

  if (currentIndex === -1) {
    newIndex = direction > 0 ? 0 : activeTasks.length - 1;
  } else {
    // Circular navigation
    newIndex = (currentIndex + direction + activeTasks.length) % activeTasks.length;
  }

  selectedTaskId = activeTasks[newIndex].id;
  updateSelectionUI();
}

function clearSelection() {
  selectedTaskId = null;
  updateSelectionUI();
}

function updateSelectionUI() {
  // Remove all selected classes
  document.querySelectorAll('.task-item.selected').forEach(el => {
    el.classList.remove('selected');
  });

  // Add selected class to current selection
  if (selectedTaskId !== null) {
    const selectedEl = document.querySelector(`.task-item[data-id="${selectedTaskId}"]`);
    if (selectedEl) {
      selectedEl.classList.add('selected');
    }
  }
}

async function toggleFocusOnSelected() {
  if (selectedTaskId === null) return;
  await setFocusOnTask(selectedTaskId);
}

async function deleteSelectedTask() {
  if (selectedTaskId === null) return;

  const activeTasks = appData.tasks.filter(t => t.status === 'active');
  const currentIndex = activeTasks.findIndex(t => t.id === selectedTaskId);

  try {
    appData = await invoke('delete_task', { id: selectedTaskId });

    // Move selection to next/previous task
    const newActiveTasks = appData.tasks.filter(t => t.status === 'active');
    if (newActiveTasks.length > 0) {
      const newIndex = Math.min(currentIndex, newActiveTasks.length - 1);
      selectedTaskId = newActiveTasks[newIndex].id;
    } else {
      selectedTaskId = null;
    }

    render();
  } catch (error) {
    showToast(error, true);
  }
}

async function moveSelectedToLater() {
  if (selectedTaskId === null) return;

  const activeTasks = appData.tasks.filter(t => t.status === 'active');
  const currentIndex = activeTasks.findIndex(t => t.id === selectedTaskId);

  try {
    appData = await invoke('move_task', { id: selectedTaskId, newStatus: 'later' });

    // Move selection to next/previous task
    const newActiveTasks = appData.tasks.filter(t => t.status === 'active');
    if (newActiveTasks.length > 0) {
      const newIndex = Math.min(currentIndex, newActiveTasks.length - 1);
      selectedTaskId = newActiveTasks[newIndex].id;
    } else {
      selectedTaskId = null;
    }

    render();

    // Expand Later section
    laterSection.classList.remove('collapsed');
    laterSection.classList.add('expanded');
  } catch (error) {
    showToast(error, true);
  }
}

function toggleLogPanel() {
  if (logOverlay.classList.contains('visible')) {
    logOverlay.classList.remove('visible');
  } else {
    logOverlay.classList.add('visible');
  }
}

async function toggleAlwaysOnTop() {
  isAlwaysOnTop = !isAlwaysOnTop;

  try {
    await invoke('toggle_always_on_top', { enabled: isAlwaysOnTop });
    pinBtn.classList.toggle('active', isAlwaysOnTop);
  } catch (error) {
    showToast(error, true);
  }
}

async function undoAction() {
  try {
    appData = await invoke('undo_action');
    render();
    showToast('Undone');
  } catch (error) {
    showToast(error, true);
  }
}

// Utilities
function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function formatTime(isoString) {
  const date = new Date(isoString);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
}

function formatEvent(event) {
  const eventMap = {
    'TASK_CREATED': 'Created',
    'MOVE_TO_ACTIVE': 'Activated',
    'MOVE_TO_LATER': 'Deferred',
    'SWITCH_FOCUS': 'Focused',
    'TASK_DONE': 'Done',
    'TASK_DELETED': 'Deleted'
  };
  return eventMap[event] || event;
}

let toastTimeout = null;
function showToast(message, isError = false) {
  toast.textContent = message;
  toast.className = 'toast' + (isError ? ' error' : '');

  // Force reflow for animation
  void toast.offsetHeight;
  toast.classList.add('visible');

  if (toastTimeout) clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove('visible');
  }, 2000);
}

// Dynamic Window Resizing
let resizeTimeout = null;

function debounce(fn, delay) {
  return function(...args) {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => fn.apply(this, args), delay);
  };
}

function calculateContentHeight() {
  const mainEl = document.querySelector('.main');

  // Temporarily remove flex: 1 to get natural height
  mainEl.style.flex = '0 0 auto';

  // Force layout recalc
  void mainEl.offsetHeight;

  // Get natural scroll height
  const height = mainEl.scrollHeight;

  // Remove inline style to restore CSS flex: 1
  mainEl.style.flex = '';

  return height;
}

async function updateWindowSize() {
  // Measure actual header height (includes border)
  const header = document.querySelector('.header');
  const headerHeight = header.getBoundingClientRect().height;

  // Measure actual main padding
  const mainEl = document.querySelector('.main');
  const mainStyle = getComputedStyle(mainEl);
  const mainPaddingTop = parseFloat(mainStyle.paddingTop);
  const mainPaddingBottom = parseFloat(mainStyle.paddingBottom);

  let totalHeight;

  if (isCompactMode) {
    // Compact: actual header + actual padding + task-list
    const taskList = document.getElementById('activeList');
    const taskListHeight = taskList.getBoundingClientRect().height;
    totalHeight = Math.max(100, headerHeight + mainPaddingTop + taskListHeight + mainPaddingBottom);
  } else {
    // Normal: sum all visible child heights
    const contentHeight = calculateContentHeight();
    totalHeight = Math.max(150, Math.min(600, headerHeight + contentHeight + mainPaddingTop + mainPaddingBottom));
  }

  try {
    await invoke('set_window_size', { width: 320, height: totalHeight });
  } catch (e) {
    console.error('Failed to resize window:', e);
  }
}

function setupResizeObserver() {
  // Use MutationObserver to detect DOM changes (task add/remove)
  const mainEl = document.querySelector('.main');

  const observer = new MutationObserver(debounce(updateWindowSize, 100));
  observer.observe(mainEl, { childList: true, subtree: true });

  // Initial resize
  setTimeout(updateWindowSize, 100);
}

// Start the app
init();
