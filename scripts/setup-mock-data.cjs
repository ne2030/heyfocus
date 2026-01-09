#!/usr/bin/env node
/**
 * Mock data setup script for HeyFocus video recording
 * Run: node scripts/setup-mock-data.js
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const APP_ID = 'com.heyfocus.focus';
const STORE_FILE = 'heyfocus_data_dev.json'; // dev mode

const dataDir = path.join(os.homedir(), 'Library', 'Application Support', APP_ID);
const storePath = path.join(dataDir, STORE_FILE);

// Today's date for log key (use local timezone, not UTC)
const now = new Date();
const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
const logKey = `logs_${today}`;

// Helper to format time (local timezone)
function formatTime(hour, minute) {
  const d = new Date();
  d.setHours(hour, minute, 0, 0);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const h = String(hour).padStart(2, '0');
  const m = String(minute).padStart(2, '0');
  return `${year}-${month}-${day}T${h}:${m}:00`;
}

// Mock tasks
const tasks = [
  { id: 1, text: 'Implement focus mode UI', status: 'active', isFocus: true },
  { id: 2, text: 'Fix notification bug', status: 'active', isFocus: false },
  { id: 3, text: 'Write unit tests', status: 'active', isFocus: false },
  { id: 4, text: 'Update documentation', status: 'later', isFocus: false },
  { id: 5, text: 'Review pull requests', status: 'later', isFocus: false },
];

// Mock logs - realistic work day
const logs = [
  // Morning task creation
  { time: formatTime(8, 0), event: 'TASK_CREATED', task: 'Implement focus mode UI', task_id: 1 },
  { time: formatTime(8, 2), event: 'TASK_CREATED', task: 'Fix notification bug', task_id: 2 },
  { time: formatTime(8, 4), event: 'TASK_CREATED', task: 'Write unit tests', task_id: 3 },
  { time: formatTime(8, 6), event: 'TASK_CREATED', task: 'Update documentation', task_id: 4 },
  { time: formatTime(8, 8), event: 'TASK_CREATED', task: 'Review pull requests', task_id: 5 },

  // Move some to later
  { time: formatTime(8, 10), event: 'MOVE_TO_LATER', task: 'Update documentation', task_id: 4, prev_status: 'active' },
  { time: formatTime(8, 11), event: 'MOVE_TO_LATER', task: 'Review pull requests', task_id: 5, prev_status: 'active' },

  // Morning deep work session
  { time: formatTime(8, 30), event: 'SWITCH_FOCUS', task: 'Implement focus mode UI', task_id: 1 },
  { time: formatTime(10, 15), event: 'SWITCH_FOCUS', task: 'Fix notification bug', task_id: 2, prev_focus_id: 1 },
  { time: formatTime(10, 45), event: 'TASK_DONE', task: 'Fix notification bug', task_id: 2, prev_status: 'active', prev_text: 'Fix notification bug', prev_focus: true },
  { time: formatTime(10, 50), event: 'SWITCH_FOCUS', task: 'Write unit tests', task_id: 3 },
  { time: formatTime(11, 30), event: 'SWITCH_FOCUS', task: 'Implement focus mode UI', task_id: 1, prev_focus_id: 3 },
  { time: formatTime(12, 0), event: 'CLEAR_FOCUS', task: 'Implement focus mode UI', task_id: 1, prev_focus: true },

  // Afternoon work
  { time: formatTime(13, 0), event: 'MOVE_TO_ACTIVE', task: 'Review pull requests', task_id: 5, prev_status: 'later' },
  { time: formatTime(13, 5), event: 'SWITCH_FOCUS', task: 'Review pull requests', task_id: 5 },
  { time: formatTime(13, 45), event: 'TASK_DONE', task: 'Review pull requests', task_id: 5, prev_status: 'active', prev_text: 'Review pull requests', prev_focus: true },
  { time: formatTime(14, 0), event: 'SWITCH_FOCUS', task: 'Implement focus mode UI', task_id: 1 },
  { time: formatTime(15, 30), event: 'SWITCH_FOCUS', task: 'Write unit tests', task_id: 3, prev_focus_id: 1 },
  { time: formatTime(16, 0), event: 'SWITCH_FOCUS', task: 'Implement focus mode UI', task_id: 1, prev_focus_id: 3 },
];

// Create store data
const storeData = {
  data: {
    tasks: tasks,
    next_id: 6,
    snapshots: []
  },
  [logKey]: logs
};

// Ensure directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
  console.log(`Created directory: ${dataDir}`);
}

// Write data
fs.writeFileSync(storePath, JSON.stringify(storeData, null, 2));
console.log(`Mock data written to: ${storePath}`);
console.log(`\nTasks: ${tasks.length}`);
console.log(`Logs: ${logs.length}`);
console.log(`\nRestart the app to load mock data.`);
