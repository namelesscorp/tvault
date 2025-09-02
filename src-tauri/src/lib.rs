use once_cell::sync::Lazy;
use std::sync::atomic::{AtomicU32, Ordering};
use std::process::Command;
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

#[tauri::command]
fn open_path_native(path: String) -> Result<(), String> {
    use std::path::Path;
    use std::process::Command;
    let p = Path::new(&path);
    if !p.exists() {
        return Err(format!("Path does not exist: {}", path));
    }
    let is_dir = p.is_dir();

    #[cfg(target_os = "linux")]
    {
        let v_display = std::env::var("DISPLAY").unwrap_or_default();
        let v_wayland = std::env::var("WAYLAND_DISPLAY").unwrap_or_default();
        let v_xdg_rt  = std::env::var("XDG_RUNTIME_DIR").unwrap_or_default();
        let v_dbus    = std::env::var("DBUS_SESSION_BUS_ADDRESS").unwrap_or_default();
        let v_home    = std::env::var("HOME").unwrap_or_default();
        let v_user    = std::env::var("USER").unwrap_or_default();
        let v_lang    = std::env::var("LANG").unwrap_or_else(|_| "C".to_string());
    
        let whitelist: [(&str, &str); 8] = [
            ("PATH", "/usr/bin:/bin:/usr/local/bin"),
            ("DISPLAY", v_display.as_str()),
            ("WAYLAND_DISPLAY", v_wayland.as_str()),
            ("XDG_RUNTIME_DIR", v_xdg_rt.as_str()),
            ("DBUS_SESSION_BUS_ADDRESS", v_dbus.as_str()),
            ("HOME", v_home.as_str()),
            ("USER", v_user.as_str()),
            ("LANG", v_lang.as_str()),
        ];
    
        let toxic_vars = [
            "LD_LIBRARY_PATH","LD_PRELOAD","APPDIR","APPIMAGE","APPIMAGE_SILENT_INSTALL",
            "GIO_MODULE_DIR","GTK_PATH","QT_PLUGIN_PATH","QT_QPA_PLATFORM_PLUGIN_PATH",
            "XDG_DATA_DIRS","XDG_CURRENT_DESKTOP","XDG_SESSION_DESKTOP"
        ];
    
        let is_dir = std::path::Path::new(&path).is_dir();
    
        let run_clean = |bin: &str, args: &[&str]| -> Result<(), String> {
            let mut cmd = std::process::Command::new(bin);
            cmd.env_clear();
            for (k, v) in &whitelist {
                if !v.is_empty() { cmd.env(k, v); }
            }
            for t in toxic_vars {
                cmd.env_remove(t);
            }
            cmd.args(args);
            match cmd.status() {
                Ok(s) if s.success() => Ok(()),
                Ok(s) => Err(format!("{bin} exited with code {:?}", s.code())),
                Err(e) => Err(format!("spawn {bin} failed: {e}")),
            }
        };
    
        let try_seq: &[(&str, &[&str])] = if is_dir {
            &[
                ("/usr/bin/xdg-open", &[&path]),
                ("/bin/xdg-open", &[&path]),
                ("/usr/bin/gio", &["open", &path]),
                ("/bin/gio", &["open", &path]),
                ("/usr/bin/kioclient5", &["exec", &path]),
                ("/usr/bin/kde-open5", &[&path]),
                ("/usr/bin/exo-open", &["--launch","FileManager", &path]),
                ("/usr/bin/nautilus", &[&path]),
                ("/usr/bin/dolphin", &[&path]),
                ("/usr/bin/thunar", &[&path]),
                ("/usr/bin/pcmanfm", &[&path]),
            ]
        } else {
            &[
                ("/usr/bin/xdg-open", &[&path]),
                ("/bin/xdg-open", &[&path]),
                ("/usr/bin/gio", &["open", &path]),
                ("/bin/gio", &["open", &path]),
                ("/usr/bin/kioclient5", &["exec", &path]),
                ("/usr/bin/kde-open5", &[&path]),
            ]
        };
    
        let mut last_err: Option<String> = None;
        for (bin, args) in try_seq {
            match run_clean(bin, args) {
                Ok(()) => return Ok(()),
                Err(e) => last_err = Some(e),
            }
        }
        return Err(last_err.unwrap_or_else(|| "no opener matched".into()));
    }

    #[cfg(target_os = "macos")]
    {
        Command::new("open")
            .arg(&path)
            .status()
            .map_err(|e| e.to_string())
            .and_then(|s| if s.success() { Ok(()) } else { Err(format!("open exited {:?}", s.code())) })
    }

    #[cfg(target_os = "windows")]
    {
        let status = Command::new("cmd")
            .args(["/C", "start", "", &path])
            .status()
            .or_else(|_| Command::new("explorer").arg(&path).status())
            .map_err(|e| e.to_string())?;
        if status.success() { Ok(()) } else { Err(format!("open failed {:?}", status.code())) }
    }
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
            app.handle().plugin(tauri_plugin_process::init());
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
            run_reseal,
            open_path_native
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
