use serde::{Deserialize, Serialize};
use std::sync::Mutex;
use tauri::{Manager, State};
use tauri_plugin_store::StoreExt;

// Use different store path for debug vs release builds
#[cfg(debug_assertions)]
const STORE_PATH: &str = "heyfocus_data_dev.json";

#[cfg(not(debug_assertions))]
const STORE_PATH: &str = "heyfocus_data.json";
const SNAPSHOT_INTERVAL: usize = 10; // Create snapshot every 10 operations

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Task {
    pub id: u64,
    pub text: String,
    pub status: String,
    #[serde(rename = "isFocus")]
    pub is_focus: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LogEntry {
    pub time: String,
    pub event: String,
    pub task: String,
    #[serde(default)]
    pub task_id: Option<u64>,
    #[serde(default)]
    pub prev_status: Option<String>,
    #[serde(default)]
    pub prev_text: Option<String>,
    #[serde(default)]
    pub prev_focus: Option<bool>,
    #[serde(default)]
    pub prev_focus_id: Option<u64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StateSnapshot {
    pub log_index: usize,
    pub tasks: Vec<Task>,
    pub next_id: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct AppData {
    pub tasks: Vec<Task>,
    pub logs: Vec<LogEntry>,
    #[serde(default)]
    pub next_id: u64,
    #[serde(default)]
    pub snapshots: Vec<StateSnapshot>,
}

pub struct AppState(pub Mutex<AppData>);

fn get_timestamp() -> String {
    chrono::Local::now().format("%Y-%m-%dT%H:%M:%S").to_string()
}

fn is_within_seconds(time_str: &str, seconds: i64) -> bool {
    use chrono::NaiveDateTime;
    if let Ok(log_time) = NaiveDateTime::parse_from_str(time_str, "%Y-%m-%dT%H:%M:%S") {
        let now = chrono::Local::now().naive_local();
        let duration = now.signed_duration_since(log_time);
        duration.num_seconds() < seconds
    } else {
        false
    }
}

fn get_today_log_key() -> String {
    let today = chrono::Local::now().format("%Y-%m-%d");
    format!("logs_{}", today)
}

fn add_log_extended(
    data: &mut AppData,
    event: &str,
    task_text: &str,
    task_id: Option<u64>,
    prev_status: Option<String>,
    prev_text: Option<String>,
    prev_focus: Option<bool>,
    prev_focus_id: Option<u64>,
) {
    data.logs.push(LogEntry {
        time: get_timestamp(),
        event: event.to_string(),
        task: task_text.to_string(),
        task_id,
        prev_status,
        prev_text,
        prev_focus,
        prev_focus_id,
    });

    // Create snapshot periodically
    if data.logs.len() % SNAPSHOT_INTERVAL == 0 {
        data.snapshots.push(StateSnapshot {
            log_index: data.logs.len(),
            tasks: data.tasks.clone(),
            next_id: data.next_id,
        });
        // Keep only last 5 snapshots
        if data.snapshots.len() > 5 {
            data.snapshots.remove(0);
        }
    }
}

fn add_log(data: &mut AppData, event: &str, task_text: &str) {
    add_log_extended(data, event, task_text, None, None, None, None, None);
}

#[tauri::command]
fn load_data(state: State<AppState>) -> AppData {
    state.0.lock().unwrap().clone()
}

#[tauri::command]
fn add_task(text: String, status: String, state: State<AppState>, app: tauri::AppHandle) -> Result<AppData, String> {
    let mut data = state.0.lock().unwrap();

    if status == "active" {
        let active_count = data.tasks.iter().filter(|t| t.status == "active").count();
        if active_count >= 5 {
            return Err("Cannot add more than 5 active tasks".to_string());
        }
    }

    let task_id = data.next_id;
    let task = Task {
        id: task_id,
        text: text.clone(),
        status,
        is_focus: false,
    };
    data.next_id += 1;
    data.tasks.push(task);
    add_log_extended(&mut data, "TASK_CREATED", &text, Some(task_id), None, None, None, None);

    save_to_store(&app, &data);
    Ok(data.clone())
}

#[tauri::command]
fn move_task(id: u64, new_status: String, state: State<AppState>, app: tauri::AppHandle) -> Result<AppData, String> {
    let mut data = state.0.lock().unwrap();

    if new_status == "active" {
        let active_count = data.tasks.iter().filter(|t| t.status == "active").count();
        if active_count >= 5 {
            return Err("Cannot have more than 5 active tasks".to_string());
        }
    }

    let task_idx = data.tasks.iter().position(|t| t.id == id);
    if let Some(idx) = task_idx {
        let task_text = data.tasks[idx].text.clone();
        let prev_status = data.tasks[idx].status.clone();
        let prev_focus = data.tasks[idx].is_focus;

        data.tasks[idx].status = new_status.clone();

        if new_status == "later" {
            data.tasks[idx].is_focus = false;
        }

        let event = if new_status == "active" { "MOVE_TO_ACTIVE" } else { "MOVE_TO_LATER" };
        add_log_extended(&mut data, event, &task_text, Some(id), Some(prev_status), None, Some(prev_focus), None);

        save_to_store(&app, &data);
        Ok(data.clone())
    } else {
        Err("Task not found".to_string())
    }
}

#[tauri::command]
fn set_focus(id: u64, state: State<AppState>, app: tauri::AppHandle) -> Result<AppData, String> {
    let mut data = state.0.lock().unwrap();

    let task_exists = data.tasks.iter().any(|t| t.id == id && t.status == "active");
    if !task_exists {
        return Err("Task not found or not active".to_string());
    }

    // Find previous focused task
    let prev_focused_id = data.tasks.iter().find(|t| t.is_focus).map(|t| t.id);
    let task_text = data.tasks.iter().find(|t| t.id == id).map(|t| t.text.clone()).unwrap();

    for task in &mut data.tasks {
        task.is_focus = task.id == id;
    }

    // Check if last log is SWITCH_FOCUS within 30 seconds - merge if so
    let should_merge = data.logs.last()
        .map(|log| log.event == "SWITCH_FOCUS" && is_within_seconds(&log.time, 30))
        .unwrap_or(false);

    if should_merge {
        // Update the existing log instead of creating a new one
        if let Some(last_log) = data.logs.last_mut() {
            last_log.task = task_text;
            last_log.task_id = Some(id);
            last_log.time = get_timestamp();
            // Keep the original prev_focus_id (the original starting point)
        }
    } else {
        add_log_extended(&mut data, "SWITCH_FOCUS", &task_text, Some(id), None, None, None, prev_focused_id);
    }

    save_to_store(&app, &data);
    Ok(data.clone())
}

#[tauri::command]
fn clear_focus(state: State<AppState>, app: tauri::AppHandle) -> Result<AppData, String> {
    let mut data = state.0.lock().unwrap();

    // Find current focused task
    let focused_task = data.tasks.iter().find(|t| t.is_focus);
    if focused_task.is_none() {
        return Ok(data.clone()); // No focused task, nothing to do
    }

    let focused_id = focused_task.map(|t| t.id);
    let focused_text = focused_task.map(|t| t.text.clone()).unwrap_or_default();

    // Clear focus from all tasks
    for task in &mut data.tasks {
        task.is_focus = false;
    }

    // Check if last log is SWITCH_FOCUS within 30 seconds - remove if so
    let should_remove = data.logs.last()
        .map(|log| log.event == "SWITCH_FOCUS" && is_within_seconds(&log.time, 30))
        .unwrap_or(false);

    if should_remove {
        // Remove the short-lived focus log
        data.logs.pop();
    } else {
        add_log_extended(&mut data, "CLEAR_FOCUS", &focused_text, focused_id, None, None, Some(true), None);
    }

    save_to_store(&app, &data);
    Ok(data.clone())
}

#[tauri::command]
fn complete_task(id: u64, state: State<AppState>, app: tauri::AppHandle) -> Result<AppData, String> {
    let mut data = state.0.lock().unwrap();

    let task_info = data.tasks.iter()
        .find(|t| t.id == id)
        .map(|t| (t.text.clone(), t.status.clone(), t.is_focus));

    if let Some((text, status, was_focused)) = task_info {
        // Store the task for undo before removing
        add_log_extended(&mut data, "TASK_DONE", &text, Some(id), Some(status), Some(text.clone()), Some(was_focused), None);

        data.tasks.retain(|t| t.id != id);

        if was_focused {
            let next_text = {
                let next = data.tasks.iter_mut().find(|t| t.status == "active");
                if let Some(task) = next {
                    task.is_focus = true;
                    Some(task.text.clone())
                } else {
                    None
                }
            };
            if let Some(t) = next_text {
                add_log(&mut data, "SWITCH_FOCUS", &t);
            }
        }

        save_to_store(&app, &data);
        Ok(data.clone())
    } else {
        Err("Task not found".to_string())
    }
}

#[tauri::command]
fn delete_task(id: u64, state: State<AppState>, app: tauri::AppHandle) -> Result<AppData, String> {
    let mut data = state.0.lock().unwrap();

    let task_info = data.tasks.iter()
        .find(|t| t.id == id)
        .map(|t| (t.text.clone(), t.status.clone(), t.is_focus));

    if let Some((text, status, was_focused)) = task_info {
        // Store the task for undo before removing
        add_log_extended(&mut data, "TASK_DELETED", &text, Some(id), Some(status), Some(text.clone()), Some(was_focused), None);

        data.tasks.retain(|t| t.id != id);

        if was_focused {
            let next_text = {
                let next = data.tasks.iter_mut().find(|t| t.status == "active");
                if let Some(task) = next {
                    task.is_focus = true;
                    Some(task.text.clone())
                } else {
                    None
                }
            };
            if let Some(t) = next_text {
                add_log(&mut data, "SWITCH_FOCUS", &t);
            }
        }

        save_to_store(&app, &data);
        Ok(data.clone())
    } else {
        Err("Task not found".to_string())
    }
}

#[tauri::command]
fn edit_task(id: u64, text: String, state: State<AppState>, app: tauri::AppHandle) -> Result<AppData, String> {
    let mut data = state.0.lock().unwrap();

    if let Some(task) = data.tasks.iter_mut().find(|t| t.id == id) {
        let prev_text = task.text.clone();
        task.text = text.clone();
        add_log_extended(&mut data, "TASK_EDITED", &text, Some(id), None, Some(prev_text), None, None);
        save_to_store(&app, &data);
        Ok(data.clone())
    } else {
        Err("Task not found".to_string())
    }
}

#[tauri::command]
fn undo_action(state: State<AppState>, app: tauri::AppHandle) -> Result<AppData, String> {
    let mut data = state.0.lock().unwrap();

    if data.logs.is_empty() {
        return Err("Nothing to undo".to_string());
    }

    let last_log = data.logs.pop().unwrap();

    match last_log.event.as_str() {
        "TASK_CREATED" => {
            // Remove the created task
            if let Some(id) = last_log.task_id {
                data.tasks.retain(|t| t.id != id);
            }
        }
        "TASK_DELETED" | "TASK_DONE" => {
            // Restore the deleted task
            if let (Some(id), Some(status), Some(text)) = (last_log.task_id, last_log.prev_status, last_log.prev_text) {
                let was_focused = last_log.prev_focus.unwrap_or(false);
                data.tasks.push(Task {
                    id,
                    text,
                    status,
                    is_focus: was_focused,
                });
                // If it was focused, unfocus any other task that got auto-focused
                if was_focused {
                    for task in &mut data.tasks {
                        if task.id != id {
                            task.is_focus = false;
                        }
                    }
                }
            }
        }
        "MOVE_TO_ACTIVE" | "MOVE_TO_LATER" => {
            // Restore previous status
            if let (Some(id), Some(prev_status)) = (last_log.task_id, last_log.prev_status) {
                if let Some(task) = data.tasks.iter_mut().find(|t| t.id == id) {
                    task.status = prev_status;
                    // Restore focus state if was focused before moving to later
                    if let Some(was_focused) = last_log.prev_focus {
                        task.is_focus = was_focused;
                    }
                }
            }
        }
        "TASK_EDITED" => {
            // Restore previous text
            if let (Some(id), Some(prev_text)) = (last_log.task_id, last_log.prev_text) {
                if let Some(task) = data.tasks.iter_mut().find(|t| t.id == id) {
                    task.text = prev_text;
                }
            }
        }
        "SWITCH_FOCUS" => {
            // Restore focus to previous task
            if let Some(prev_id) = last_log.prev_focus_id {
                for task in &mut data.tasks {
                    task.is_focus = task.id == prev_id;
                }
            } else {
                // No previous focus - unfocus all
                for task in &mut data.tasks {
                    task.is_focus = false;
                }
            }
        }
        "CLEAR_FOCUS" => {
            // Restore focus to the task that was unfocused
            if let Some(id) = last_log.task_id {
                for task in &mut data.tasks {
                    task.is_focus = task.id == id;
                }
            }
        }
        _ => {}
    }

    save_to_store(&app, &data);
    Ok(data.clone())
}

#[tauri::command]
fn clear_logs(state: State<AppState>, app: tauri::AppHandle) -> AppData {
    let mut data = state.0.lock().unwrap();
    data.logs.clear();
    data.snapshots.clear();
    save_to_store(&app, &data);
    data.clone()
}

#[tauri::command]
fn toggle_always_on_top(enabled: bool, app: tauri::AppHandle) -> Result<(), String> {
    if let Some(window) = app.get_webview_window("main") {
        window.set_always_on_top(enabled).map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
fn set_window_size(width: f64, height: f64, app: tauri::AppHandle) -> Result<(), String> {
    if let Some(window) = app.get_webview_window("main") {
        let size = tauri::LogicalSize::new(width, height);
        window.set_size(size).map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
fn open_log_window(app: tauri::AppHandle) -> Result<(), String> {
    use tauri::WebviewWindowBuilder;

    // Check if log window already exists
    if app.get_webview_window("log").is_some() {
        // Focus existing window
        if let Some(window) = app.get_webview_window("log") {
            window.set_focus().map_err(|e| e.to_string())?;
        }
        return Ok(());
    }

    // Create new log window
    WebviewWindowBuilder::new(&app, "log", tauri::WebviewUrl::App("index.html#log".into()))
        .title("Activity Log")
        .inner_size(400.0, 500.0)
        .resizable(true)
        .decorations(true)
        .build()
        .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
fn open_stats_window(app: tauri::AppHandle) -> Result<(), String> {
    use tauri::WebviewWindowBuilder;

    // Check if stats window already exists
    if app.get_webview_window("stats").is_some() {
        // Focus existing window
        if let Some(window) = app.get_webview_window("stats") {
            window.set_focus().map_err(|e| e.to_string())?;
        }
        return Ok(());
    }

    // Create new stats window
    let builder = WebviewWindowBuilder::new(&app, "stats", tauri::WebviewUrl::App("index.html#stats".into()))
        .title("Focus Statistics")
        .inner_size(1000.0, 820.0)
        .min_inner_size(800.0, 600.0)
        .resizable(true)
        .decorations(true);

    #[cfg(debug_assertions)]
    let builder = builder.devtools(true);

    builder.build().map_err(|e| e.to_string())?;

    Ok(())
}

fn save_to_store(app: &tauri::AppHandle, data: &AppData) {
    if let Ok(store) = app.store(STORE_PATH) {
        // Save main data (tasks, next_id, snapshots) - without logs
        let main_data = serde_json::json!({
            "tasks": data.tasks,
            "next_id": data.next_id,
            "snapshots": data.snapshots,
        });
        let _ = store.set("data", main_data);

        // Save logs to today's key
        let log_key = get_today_log_key();
        let _ = store.set(&log_key, serde_json::to_value(&data.logs).unwrap_or_default());

        let _ = store.save();
    }
}

fn load_from_store(app: &tauri::AppHandle) -> AppData {
    if let Ok(store) = app.store(STORE_PATH) {
        let mut result = AppData::default();

        // Load main data
        if let Some(value) = store.get("data") {
            if let Ok(main) = serde_json::from_value::<serde_json::Value>(value.clone()) {
                if let Some(tasks) = main.get("tasks") {
                    if let Ok(t) = serde_json::from_value(tasks.clone()) {
                        result.tasks = t;
                    }
                }
                if let Some(next_id) = main.get("next_id") {
                    if let Ok(n) = serde_json::from_value(next_id.clone()) {
                        result.next_id = n;
                    }
                }
                if let Some(snapshots) = main.get("snapshots") {
                    if let Ok(s) = serde_json::from_value(snapshots.clone()) {
                        result.snapshots = s;
                    }
                }
            }
        }

        // Load today's logs only
        let log_key = get_today_log_key();
        if let Some(logs_value) = store.get(&log_key) {
            if let Ok(logs) = serde_json::from_value(logs_value.clone()) {
                result.logs = logs;
            }
        }

        return result;
    }
    AppData::default()
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::new().build())
        .setup(|app| {
            let data = load_from_store(&app.handle());
            app.manage(AppState(Mutex::new(data)));
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            load_data,
            add_task,
            move_task,
            set_focus,
            clear_focus,
            complete_task,
            delete_task,
            toggle_always_on_top,
            set_window_size,
            edit_task,
            undo_action,
            open_log_window,
            open_stats_window,
            clear_logs,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
