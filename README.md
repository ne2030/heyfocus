# HeyFocus

[English](README.md) | [한국어](README.ko.md)

A focus management app that visualizes the mental threads in your head.

## Introduction

HeyFocus is an app that helps you manage your ongoing and pending tasks by visualizing them as **mental threads**.

By limiting only up to 5 threads to be "Active" at a time, it acts as a **guardrail** to prevent you from taking on too many things at once. It keeps your thoughts from wandering too far and helps you stay focused on what matters right now.

## Key Features

### Task Management
- **Active/Later Classification** - Organize tasks into "do now" and "do later"
- **5 Task Limit** - Active tasks are limited to 5 to maintain focus
- **Drag and Drop** - Move tasks between Active/Later by dragging
- **Inline Editing** - Double-click tasks to edit directly

### Focus System
- **Focus Mode** - Set one Active task as focused to highlight your current work
- **Slot Indicator** - Visualize Active task status with 5 dots in the header
- **Auto Focus Switch** - Automatically moves to the next task when focused task is completed

### Window Management
- **Global Shortcut** - Press `Ctrl+F` from anywhere to instantly focus HeyFocus
- **Always on Top** - Keep the window above all other windows
- **Compact Mode** - Minimized UI to save screen space
- **Opacity Control** - Adjust window transparency (30~100%)
- **Auto Resize** - Window height adjusts automatically based on content

### Other
- **Undo** - Undo any action with `Cmd+Z` (add, delete, complete, move, edit, etc.)
- **Activity Log** - Save all task changes and view in a separate window
- **Statistics** - Display completion count, focus switches, and total events

## Tech Stack

| Category | Technology |
|----------|------------|
| **Frontend** | React 18, TypeScript |
| **Styling** | Tailwind CSS |
| **State Management** | Zustand |
| **Build Tool** | Vite |
| **Backend** | Rust (Tauri 2.0) |
| **Storage** | tauri-plugin-store (local JSON file) |

## System Requirements

- macOS 10.15 or later
- (Windows/Linux support coming soon)

## Installation & Running

### Development Setup

```bash
# Install dependencies
npm install

# Run development server (web browser)
npm run dev

# Run as Tauri app
npm run tauri:dev
```

### Production Build

```bash
# Build Tauri app
npm run tauri:build
```

## Keyboard Shortcuts

### Global (System-wide)

| Shortcut | Action |
|----------|--------|
| `Ctrl+F` | Focus HeyFocus window from anywhere |

### Navigation

| Shortcut | Action |
|----------|--------|
| `↑` / `↓` | Navigate between Active tasks (cycles) |
| `Cmd+1~5` | Select Active task by index |
| `Escape` | Deselect |
| `Cmd+N` | Focus on add task input |

### Task Actions

| Shortcut | Action |
|----------|--------|
| `Space` | Toggle focus on selected task |
| `D` | Delete selected task |
| `L` | Move selected task to Later |
| `I` | Enter edit mode for selected task |
| `Cmd+Z` | Undo |

### Window Controls

| Shortcut | Action |
|----------|--------|
| `Cmd+P` | Toggle always on top |
| `Cmd+M` | Toggle compact mode |
| `Cmd+[` | Decrease opacity by 5% |
| `Cmd+]` | Increase opacity by 5% |
| `Cmd+S` | Open settings panel |

## Project Structure

```
heyfocus/
├── src/                          # Frontend source
│   ├── components/
│   │   ├── sections/             # Main section components
│   │   │   ├── Header.tsx
│   │   │   ├── ActiveSection.tsx
│   │   │   ├── LaterSection.tsx
│   │   │   └── AddTaskForm.tsx
│   │   ├── task/                 # Task-related components
│   │   │   ├── TaskList.tsx
│   │   │   └── TaskItem.tsx
│   │   ├── log/                  # Log-related components
│   │   │   ├── LogWindow.tsx
│   │   │   └── LogOverlay.tsx
│   │   ├── ui/                   # UI base components
│   │   │   ├── Icons.tsx
│   │   │   ├── IconButton.tsx
│   │   │   └── SlotIndicator.tsx
│   │   └── Toast.tsx
│   ├── hooks/                    # Custom hooks
│   │   ├── useKeyboardShortcuts.ts
│   │   ├── useWindowFocus.ts
│   │   └── useWindowResize.ts
│   ├── lib/                      # Utilities
│   │   ├── broadcast.ts
│   │   ├── tauri.ts
│   │   └── utils.ts
│   ├── store/                    # State management
│   │   └── useAppStore.ts
│   ├── types/                    # TypeScript type definitions
│   │   └── index.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── src-tauri/                    # Tauri backend
│   ├── src/
│   │   ├── main.rs
│   │   └── lib.rs
│   ├── Cargo.toml
│   └── tauri.conf.json
├── index.html
├── package.json
├── tailwind.config.js
├── vite.config.ts
└── tsconfig.json
```

## License

MIT License
