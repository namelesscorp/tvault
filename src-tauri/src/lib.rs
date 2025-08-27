use once_cell::sync::Lazy;
use std::sync::atomic::{AtomicU32, Ordering};
use tauri::{AppHandle, Emitter, Manager};
use tauri_plugin_single_instance;
use tauri_plugin_fs;
use tauri_plugin_store;
use tauri_plugin_updater;
mod cli_runner;

use cli_runner::{run_encrypt, run_decrypt, run_container_info, run_reseal, container_info_once}; 

/* ---------- scan directory for containers ---------- */
#[tauri::command]
fn scan_containers_directory(path: String) -> Result<Vec<String>, String> {
    use std::fs;
    use std::path::Path;
    
    let dir = Path::new(&path);
    if !dir.exists() || !dir.is_dir() {
        return Ok(vec![]);
    }
    
    let mut containers = Vec::new();
    
    if let Ok(entries) = fs::read_dir(dir) {
        for entry in entries.flatten() {
            if let Ok(metadata) = entry.metadata() {
                if metadata.is_file() {
                    if let Some(extension) = entry.path().extension() {
                        if extension == "tvlt" {
                            if let Some(path_str) = entry.path().to_str() {
                                containers.push(path_str.to_string());
                            }
                        }
                    }
                }
            }
        }
    }
    
    Ok(containers)
}

/* ---------- global counter ---------- */
static ENTROPY_BITS: Lazy<AtomicU32> = Lazy::new(|| AtomicU32::new(0));
const TARGET_BITS: u32 = 512;
const ENTROPY_PER_BYTE_NUM: u32 = 1;
const ENTROPY_PER_BYTE_DEN: u32 = 2;

/* ---------- IPC: accept entropy ---------- */
#[tauri::command]
fn entropy_batch(app: AppHandle, bytes: Vec<u8>) -> u32 {
    /* add 0.5 bit for each byte */
    let added = (bytes.len() as u32 * ENTROPY_PER_BYTE_NUM) / ENTROPY_PER_BYTE_DEN;
    let total = ENTROPY_BITS.fetch_add(added, Ordering::SeqCst) + added;

    if total >= TARGET_BITS {
        ENTROPY_BITS.store(0, Ordering::SeqCst);
        app.emit("entropy_ready", ()).ok();
    }
    total.min(TARGET_BITS)
}

#[tauri::command]
fn check_container_path(path: String) -> Result<(), String> {
    use std::path::Path;
    let p = Path::new(&path);
    if p.exists() {
        return Err("vault.basic.error.outputPathExists".into());
    }
    if let Some(parent) = p.parent() {
        std::fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
fn check_file_exists(path: String) -> Result<bool, String> {
    use std::path::Path;
    let p = Path::new(&path);
    Ok(p.exists() && p.is_file())
}

#[tauri::command]
fn remove_dir(path: String, recursive: bool) -> Result<(), String> {
    use std::fs;
    use std::path::Path;
    
    let p = Path::new(&path);
    if !p.exists() {
        return Ok(());
    }
    
    if recursive {
        fs::remove_dir_all(p).map_err(|e| e.to_string())?;
    } else {
        fs::remove_dir(p).map_err(|e| e.to_string())?;
    }
    
    Ok(())
}


/* ---------- run Tauri ---------- */
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_single_instance::init(|app, _argv, _cwd| {
            bring_to_front(app);
        }))
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            #[cfg(desktop)]
            app.handle().plugin(tauri_plugin_updater::Builder::new().build());
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            entropy_batch,
            check_container_path,
            check_file_exists,
            remove_dir,
            scan_containers_directory,
            run_encrypt,
            run_decrypt,
            run_container_info,
            container_info_once,
            run_reseal
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

/* ---------- bring already running window to the front ---------- */
fn bring_to_front(app: &AppHandle) {
    if let Some(win) = app.get_webview_window("main") {
        // v2 API
        let _ = win.unminimize();
        let _ = win.set_focus();
        let _ = win.show();
    }
}
