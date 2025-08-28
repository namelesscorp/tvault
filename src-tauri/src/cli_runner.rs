//! cli_runner.rs — GUI ↔ tvault-core (encrypt/decrypt bridge)

use std::{
  env::current_exe,
  io::{BufRead, BufReader},
  path::PathBuf,
  process::{Command, Stdio},
};

use serde::Deserialize;
use serde_json::Value;
use tauri::{AppHandle, Emitter, Wry};
#[cfg(target_os = "windows")]
use std::os::windows::process::CommandExt;

/* ─────────── Encrypt/Decrypt Arguments ─────────── */

#[derive(Deserialize)]
pub struct EncryptArgs {
  name:                Option<String>,
  container_path:      String,
  folder_path:         String,
  compression_type:    String,
  passphrase:          String,            // collected entropy
  token_type:          String,            // master | share | none
  token_save_type:     String,            // file | stdout
  token_save_path:     Option<String>,
  number_of_shares:    Option<u8>,
  threshold:           Option<u8>,
  integrity_provider:  String,            // none | hmac
  additional_password: Option<String>,
  comment:             Option<String>,
  tags:                Option<String>,
}

#[derive(Deserialize)]
pub struct DecryptArgs {
  container_path:      String,
  folder_path:         String,
  token:               Option<String>,           // direct passphrase (no tokens)
  master_token:        Option<String>,           // master token for master+password flow
  token_reader_type:   Option<String>,          // flag | file
  token_format:        Option<String>,          // json | plaintext
  token_flag:          Option<String>,          // value when type=flag
  token_path:          Option<String>,          // path when type=file
  additional_password: Option<String>,          // integrity current passphrase
}

#[derive(Deserialize)]
pub struct ContainerInfoArgs {
  path: String,
}

#[derive(Deserialize)]
#[derive(Debug)]
pub struct ResealArgs {
  current_path:        String,
  new_path:            Option<String>,
  folder_path:         String,
  name:                Option<String>,
  passphrase:          Option<String>,
  comment:             Option<String>,
  tags:                Option<String>,
  integrity_provider:  Option<String>,   // none | hmac | ed25519
  current_integrity_password: Option<String>,
  new_integrity_password: Option<String>,
  master_token:        Option<String>,
  shares:              Option<Vec<String>>,
  token_type:          Option<String>,
  token_json_path:     Option<String>,
}

/* ─────────── Public Commands ─────────── */

#[tauri::command]
pub async fn run_encrypt(app: AppHandle<Wry>, args: EncryptArgs) -> Result<(), String> {
  validate_encrypt(&args)?;
  let cmd = build_seal_cmd(args)?;
  spawn_process(app, cmd, "encrypt")
}

#[tauri::command]
pub async fn run_decrypt(app: AppHandle<Wry>, args: DecryptArgs) -> Result<(), String> {
  // Ensure target folder exists; create recursively
  let folder = args.folder_path.clone();
  if let Err(e) = std::fs::create_dir_all(&folder) {
    // If cannot create, still try to run — CLI may create itself
    let _ = app.emit("decrypt-stderr", format!("failed to create folder {folder}: {e}"));
  }
  let cmd = build_unseal_cmd(args)?;
  spawn_process(app, cmd, "decrypt")
}

#[tauri::command]
pub async fn run_container_info(app: AppHandle<Wry>, args: ContainerInfoArgs) -> Result<(), String> {
  let path_ctx = args.path.clone();
  let cmd = build_container_info_cmd(args)?;
  // custom spawn to attach context.path into result
  spawn_process_with_context(app, cmd, "info", Some(path_ctx))
}

#[tauri::command]
pub async fn container_info_once(args: ContainerInfoArgs) -> Result<serde_json::Value, String> {
  use std::io::Read;
  let path_ctx = args.path.clone();
  let mut cmd = build_container_info_cmd(args)?;
  #[cfg(target_os = "windows")]
  { cmd.creation_flags(0x08000000); } // CREATE_NO_WINDOW
  let mut child = cmd.stdout(Stdio::piped()).stderr(Stdio::piped()).spawn().map_err(|e| e.to_string())?;
  let mut stdout = String::new();
  if let Some(mut out) = child.stdout.take() { let _ = out.read_to_string(&mut stdout); }
  let _ = child.wait();

  // Try parse as JSON object, or slice {...}
  let classify_emit = |val: Value| -> Value {
    let is_err = val.get("code").is_some() && val.get("message").is_some();
    if is_err { serde_json::json!({ "path": path_ctx, "error": val }) }
    else { serde_json::json!({ "path": path_ctx, "data": val }) }
  };

  if let Ok(val) = serde_json::from_str::<Value>(&stdout) {
    return Ok(classify_emit(val));
  }
  if let (Some(s), Some(e)) = (stdout.find('{'), stdout.rfind('}')) {
    if e >= s { if let Ok(val) = serde_json::from_str::<Value>(&stdout[s..=e]) { return Ok(classify_emit(val)); } }
  }
  Err("invalid info output".into())
}

#[tauri::command]
pub async fn run_reseal(app: AppHandle<Wry>, args: ResealArgs) -> Result<(), String> {
  let cmd = build_reseal_cmd(args)?;
  spawn_process(app, cmd, "reseal")
}

/* ─────────── CLI Command Building ─────────── */

fn build_seal_cmd(a: EncryptArgs) -> Result<Command, String> {
  let mut c = Command::new(locate_binary()?);
  // tvault-core new CLI: seal container ... subcommands
  c.args([
    "seal",
    "container",
  ]);
  if let Some(name) = a.name { c.arg(format!("-name={name}")); }
  c.args([
    &format!("-new-path={}", a.container_path),
    &format!("-folder-path={}", a.folder_path),
    &format!("-passphrase={}", a.passphrase),
  ]);
  if let Some(cmt) = a.comment { c.arg(format!("-comment={cmt}")); }
  if let Some(tgs) = a.tags { c.arg(format!("-tags={tgs}")); }
  c.args([
    "compression",
    &format!("-type={}", a.compression_type),
    "token",
    &format!("-type={}", a.token_type),
    "token-writer",
    &format!("-type={}", a.token_save_type),
    "-format=json",
  ]);
  if let Some(p) = a.token_save_path {
    c.arg(format!("-path={p}"));
  }
  if a.token_type == "share" {
      let n = a.number_of_shares.unwrap_or(5);
      let k = a.threshold.unwrap_or(3);
    c.args(["shamir", &format!("-is-enabled={}", true.to_string()), &format!("-shares={n}"), &format!("-threshold={k}")]);
  } else {
    c.args(["shamir", &format!("-is-enabled={}", false.to_string())]);
  }
  c.args(["integrity-provider", &format!("-type={}", a.integrity_provider)]);
  if a.integrity_provider == "hmac" {
      if let Some(add) = a.additional_password {
      c.arg(format!("-new-passphrase={add}"));
      }
  }
  c.args(["log-writer", "-type=stdout", "-format=json"]);
  Ok(c)
}

fn build_unseal_cmd(a: DecryptArgs) -> Result<Command, String> {
  let mut c = Command::new(locate_binary()?);
  c.args([
    "unseal",
    "container",
    &format!("-current-path={}", a.container_path),
    &format!("-folder-path={}", a.folder_path),
  ]);

  // If both master token and password are provided, use both parameters
  if a.token.is_some() && a.master_token.is_some() {
    if let (Some(pass), Some(master)) = (a.token.as_ref(), a.master_token.as_ref()) {
      c.arg(format!("-passphrase={pass}"));
      c.args(["token-reader", "-type=flag", "-format=plaintext", &format!("-flag={}", master)]);
    }
  } else if let Some(reader_type) = a.token_reader_type.as_deref() {
    // Use token-reader for shares or master token only
    match (reader_type, a.token_format.as_deref()) {
      ("flag", Some(fmt)) => {
        let flag = a.token_flag.unwrap_or_default();
        c.args(["token-reader", "-type=flag", &format!("-format={}", fmt), &format!("-flag={}", flag)]);
      }
      ("file", Some(fmt)) => {
        let path = a.token_path.unwrap_or_default();
        c.args(["token-reader", "-type=file", &format!("-format={}", fmt), &format!("-path={}", path)]);
      }
      _ => {
        // If format is not specified but token exists, use passphrase
        if let Some(pass) = a.token { 
          c.arg(format!("-passphrase={pass}")); 
        }
      }
    }
  } else if a.token.is_some() {
    // If only password is provided (type=none), use passphrase
    if let Some(pass) = a.token { 
      c.arg(format!("-passphrase={pass}"));
      // For type=none, password must be passed both in passphrase and flag
      c.args(["token-reader", "-type=flag", "-format=plaintext", &format!("-flag={}", pass)]);
    }
  }

  if let Some(p) = a.additional_password {
    c.args(["integrity-provider", &format!("-current-passphrase={p}")]);
  }

  c.args(["log-writer", "-type=stdout", "-format=json"]);
  Ok(c)
}

fn build_container_info_cmd(a: ContainerInfoArgs) -> Result<Command, String> {
  let mut c = Command::new(locate_binary()?);
  c.args([
    "container",
    "info",
    &format!("-path={}", a.path),
    "info-writer",
    "-type=stdout",
    "-format=json",
    "log-writer",
    "-type=stdout",
    "-format=json",
  ]);
  Ok(c)
}

fn build_reseal_cmd(a: ResealArgs) -> Result<Command, String> {
  let mut c = Command::new(locate_binary()?);
  c.args([
    "reseal",
    "container",
    &format!("-current-path={}", a.current_path),
    &format!("-folder-path={}", a.folder_path),
  ]);
  
  let mut cmd_args = vec![
    "reseal".to_string(),
    "container".to_string(),
    format!("-current-path={}", a.current_path),
    format!("-folder-path={}", a.folder_path),
  ];
  
  if let Some(ref newp) = a.new_path { 
    c.arg(format!("-new-path={newp}")); 
    cmd_args.push(format!("-new-path={newp}"));
  }
  if let Some(ref name) = a.name { 
    c.arg(format!("-name={name}")); 
    cmd_args.push(format!("-name={name}"));
  }
  if let Some(ref pf) = a.passphrase { 
    c.arg(format!("-passphrase={pf}")); 
    cmd_args.push(format!("-passphrase={pf}"));
  }
  if let Some(ref cmt) = a.comment { 
    c.arg(format!("-comment={cmt}")); 
    cmd_args.push(format!("-comment={cmt}"));
  }
  if let Some(ref tags) = a.tags { 
    c.arg(format!("-tags={tags}")); 
    cmd_args.push(format!("-tags={tags}"));
  }

  if let Some(ref token_type) = a.token_type {
    match token_type.as_str() {
      "master" => {
        if let Some(ref master_token) = a.master_token {
          c.args(["token-reader", "-type=flag", "-format=plaintext", &format!("-flag={}", master_token)]);
          cmd_args.push("token-reader".to_string());
          cmd_args.push("-type=flag".to_string());
          cmd_args.push("-format=plaintext".to_string());
          cmd_args.push(format!("-flag={}", master_token));
        }
      },
      "share" => {
        if let Some(ref token_json_path) = a.token_json_path {
          c.args(["token-reader", "-type=file", "-format=json", &format!("-path={}", token_json_path)]);
          cmd_args.push("token-reader".to_string());
          cmd_args.push("-type=file".to_string());
          cmd_args.push("-format=json".to_string());
          cmd_args.push(format!("-path={}", token_json_path));
        } else if let Some(ref shares) = a.shares {
          let shares_str = shares.join("|");
          c.args(["token-reader", "-type=flag", "-format=plaintext", &format!("-flag={}", shares_str)]);
          cmd_args.push("token-reader".to_string());
          cmd_args.push("-type=flag".to_string());
          cmd_args.push("-format=plaintext".to_string());
          cmd_args.push(format!("-flag={}", shares_str));
        }
      },
      "none" => {
        if let Some(ref pf) = a.passphrase {
          c.args(["token-reader", "-type=flag", "-format=plaintext", &format!("-flag={}", pf)]);
          cmd_args.push("token-reader".to_string());
          cmd_args.push("-type=flag".to_string());
          cmd_args.push("-format=plaintext".to_string());
          cmd_args.push(format!("-flag={}", pf));
        }
        println!("[tvault] Using passphrase-only mode (type=none)");
      },
      _ => {}
    }
  }

  if let Some(ref ip) = a.integrity_provider {
    if ip != "none" {
      c.args(["integrity-provider"]);
      cmd_args.push("integrity-provider".to_string());
    }
  }
  if let Some(ref cur) = a.current_integrity_password { 
    c.arg(format!("-current-passphrase={cur}")); 
    cmd_args.push(format!("-current-passphrase={cur}"));
  }
  if let Some(ref new) = a.new_integrity_password { 
    c.arg(format!("-new-passphrase={new}")); 
    cmd_args.push(format!("-new-passphrase={new}"));
  } else if let Some(ref cur) = a.current_integrity_password {
    c.arg(format!("-new-passphrase={cur}")); 
    cmd_args.push(format!("-new-passphrase={cur}"));
  }
  c.args(["log-writer", "-type=stdout", "-format=json"]);
  cmd_args.push("log-writer".to_string());
  cmd_args.push("-type=stdout".to_string());
  cmd_args.push("-format=json".to_string());
  
  Ok(c)
}

/* ─────────── Process Execution & Events ─────────── */

fn spawn_process(app: AppHandle<Wry>, mut cmd: Command, prefix: &'static str) -> Result<(), String> {
  #[cfg(target_os = "windows")]
  { cmd.creation_flags(0x08000000); } // CREATE_NO_WINDOW
  let mut child = cmd.stdout(Stdio::piped()).stderr(Stdio::piped()).spawn().map_err(|e| e.to_string())?;
  let stdout = child.stdout.take().ok_or("cannot capture stdout")?;
  let stderr = child.stderr.take().ok_or("cannot capture stderr")?;

  tauri::async_runtime::spawn(async move {
      let reader = BufReader::new(stdout);
      let err_reader = BufReader::new(stderr);
      let mut all_stdout_lines: Vec<String> = Vec::new();
      let mut err_acc = String::new();
      let mut last_json: Option<Value> = None;

      for line in reader.lines().flatten() {
          let _ = app.emit(&format!("{prefix}-stdout"), line.clone());
          if let Some(p) = line.strip_prefix("PROGRESS ") {
              if let Ok(n) = p.trim().parse::<u8>() {
                  let _ = app.emit(&format!("{prefix}-progress"), n);
              }
              continue;
          }
          // try parse line-by-line JSON; keep last json object
          match serde_json::from_str::<Value>(&line) {
              Ok(val) => {
                  if val.is_object() || val.is_array() {
                      last_json = Some(val);
                  } else {
                      // it's a scalar (likely a JSON string) — accumulate for later
                      all_stdout_lines.push(line.clone());
                  }
              }
              Err(_) => {
                  all_stdout_lines.push(line.clone());
              }
          }
      }

      for line in err_reader.lines().flatten() {
          err_acc.push_str(&line);
          err_acc.push('\n');
          let _ = app.emit(&format!("{prefix}-stderr"), line);
      }

      let ok = child.wait().map(|s| s.success()).unwrap_or(false);
      let _ = app.emit(&format!("{prefix}-done"), ok);

      // Prefer last parsed JSON line, else try whole-stdout accumulation
      if let Some(val) = last_json {
          // classify as error or result based on tvault-core error JSON shape
          let is_err = val.get("code").is_some() && val.get("message").is_some();
          if is_err {
              let _ = app.emit(&format!("{prefix}-error"), val);
          } else {
              let _ = app.emit(&format!("{prefix}-result"), val);
          }
      } else {
          let joined = all_stdout_lines.join("\n");
          // Try to cut to the first '{' and last '}' to extract JSON object
          let json_slice = if let (Some(s), Some(e)) = (joined.find('{'), joined.rfind('}')) {
              if e >= s { Some(&joined[s..=e]) } else { None }
          } else { None };

          if let Some(slice) = json_slice {
              if let Ok(val) = serde_json::from_str::<Value>(slice) {
                  let is_err = val.get("code").is_some() && val.get("message").is_some();
                  if is_err {
                      let _ = app.emit(&format!("{prefix}-error"), val);
                  } else {
                      let _ = app.emit(&format!("{prefix}-result"), val);
                  }
              }
          } else if let Ok(val) = serde_json::from_str::<Value>(&joined) {
              let is_err = val.get("code").is_some() && val.get("message").is_some();
              if is_err {
                  let _ = app.emit(&format!("{prefix}-error"), val);
              } else {
                  let _ = app.emit(&format!("{prefix}-result"), val);
              }
          }
      }
      if !ok && !err_acc.is_empty() {
          let _ = app.emit(&format!("{prefix}-error"), err_acc);
      }
  });

  Ok(())
}

fn spawn_process_with_context(app: AppHandle<Wry>, mut cmd: Command, prefix: &'static str, context_path: Option<String>) -> Result<(), String> {
  #[cfg(target_os = "windows")]
  { cmd.creation_flags(0x08000000); } // CREATE_NO_WINDOW
  let mut child = cmd.stdout(Stdio::piped()).stderr(Stdio::piped()).spawn().map_err(|e| e.to_string())?;
  let stdout = child.stdout.take().ok_or("cannot capture stdout")?;
  let stderr = child.stderr.take().ok_or("cannot capture stderr")?;

  tauri::async_runtime::spawn(async move {
      let reader = BufReader::new(stdout);
      let err_reader = BufReader::new(stderr);
      let mut all_stdout_lines: Vec<String> = Vec::new();
      let mut err_acc = String::new();
      let mut last_json: Option<Value> = None;

      for line in reader.lines().flatten() {
          let _ = app.emit(&format!("{prefix}-stdout"), line.clone());
          if let Some(p) = line.strip_prefix("PROGRESS ") {
              if let Ok(n) = p.trim().parse::<u8>() {
                  let _ = app.emit(&format!("{prefix}-progress"), n);
              }
              continue;
          }
          match serde_json::from_str::<Value>(&line) {
              Ok(val) => {
                  if val.is_object() || val.is_array() {
                      last_json = Some(val);
                  } else {
                      all_stdout_lines.push(line.clone());
                  }
              }
              Err(_) => {
                  all_stdout_lines.push(line.clone());
              }
          }
      }

      for line in err_reader.lines().flatten() {
          err_acc.push_str(&line);
          err_acc.push('\n');
          let _ = app.emit(&format!("{prefix}-stderr"), line);
      }

      let ok = child.wait().map(|s| s.success()).unwrap_or(false);
      let _ = app.emit(&format!("{prefix}-done"), ok);

      let emit_with_ctx = |val: Value| {
          if let Some(p) = &context_path {
              let wrapped = serde_json::json!({ "path": p, "data": val });
              let _ = app.emit(&format!("{prefix}-result"), wrapped);
          } else {
          let _ = app.emit(&format!("{prefix}-result"), val);
          }
      };

      if let Some(val) = last_json {
          let is_err = val.get("code").is_some() && val.get("message").is_some();
          if is_err {
              if let Some(p) = &context_path {
                  let wrapped = serde_json::json!({ "path": p, "error": val });
                  let _ = app.emit(&format!("{prefix}-error"), wrapped);
              } else {
                  let _ = app.emit(&format!("{prefix}-error"), val);
              }
          } else {
              emit_with_ctx(val);
          }
      } else {
          let joined = all_stdout_lines.join("\n");
          let json_slice = if let (Some(s), Some(e)) = (joined.find('{'), joined.rfind('}')) {
              if e >= s { Some(&joined[s..=e]) } else { None }
          } else { None };

          if let Some(slice) = json_slice {
              if let Ok(val) = serde_json::from_str::<Value>(slice) {
                  let is_err = val.get("code").is_some() && val.get("message").is_some();
                  if is_err {
                      if let Some(p) = &context_path {
                          let wrapped = serde_json::json!({ "path": p, "error": val });
                          let _ = app.emit(&format!("{prefix}-error"), wrapped);
                      } else {
                          let _ = app.emit(&format!("{prefix}-error"), val);
                      }
                  } else {
                      emit_with_ctx(val);
                  }
              }
          } else if let Ok(val) = serde_json::from_str::<Value>(&joined) {
              let is_err = val.get("code").is_some() && val.get("message").is_some();
              if is_err {
                  if let Some(p) = &context_path {
                      let wrapped = serde_json::json!({ "path": p, "error": val });
                      let _ = app.emit(&format!("{prefix}-error"), wrapped);
                  } else {
                      let _ = app.emit(&format!("{prefix}-error"), val);
                  }
              } else {
                  emit_with_ctx(val);
              }
          }
      }
      if !ok && !err_acc.is_empty() {
          let _ = app.emit(&format!("{prefix}-error"), err_acc);
      }
  });

  Ok(())
}

/* ─────────── Encrypt Validation ─────────── */

fn validate_encrypt(a: &EncryptArgs) -> Result<(), String> {
  if a.token_save_type == "file" && a.token_save_path.is_none() {
      return Err("token_save_path is required when token_save_type=file".into());
  }
  if a.integrity_provider == "hmac" && a.additional_password.is_none() {
      return Err("additional_password is required when integrity_provider=hmac".into());
  }
  if a.token_type == "share" {
      let k = a.threshold.unwrap_or(3);
      let n = a.number_of_shares.unwrap_or(5);
      if k > n {
          return Err("threshold cannot be greater than number_of_shares".into());
      }
      if k < 2 || n < 2 {
          return Err("threshold and number_of_shares must be at least 2".into());
      }
      if k > 16 || n > 16 {
          return Err("threshold and number_of_shares cannot exceed 16".into());
      }
  }
  Ok(())
}

/* ─────────── Locate tvault-core ─────────── */

fn locate_binary() -> Result<PathBuf, String> {
  use std::fs;
  #[cfg(unix)] use std::os::unix::fs::PermissionsExt;

  let exe = current_exe().map_err(|e| e.to_string())?;
  let dir = exe.parent().ok_or("failed to locate dir")?;

  #[cfg(target_os = "windows")]
  let candidates = vec![dir.join("tvault-core.exe")];

  #[cfg(not(target_os = "windows"))]
  let candidates = {
    let mut v = vec![dir.join("tvault-core"), dir.join("tvault-core-aarch64-apple-darwin")];
    // dev-run fallback: ../../src-tauri/binaries/...
    if let Some(project_root) = dir.parent().and_then(|p| p.parent()) {
      v.push(project_root.join("src-tauri/binaries/tvault-core"));
      v.push(project_root.join("src-tauri/binaries/tvault-core-aarch64-apple-darwin"));
    }
    v
  };

  let mut tried: Vec<String> = Vec::new();
  for c in candidates {
    let disp = c.display().to_string();
    tried.push(disp.clone());
    if c.exists() {
      // try to ensure executable bit; ignore errors on non-unix
      #[cfg(unix)]
      if let Ok(meta) = fs::metadata(&c) {
        let mut perm = meta.permissions();
        let mode = perm.mode();
        if mode & 0o111 == 0 {
          let new_mode = mode | 0o755;
          perm.set_mode(new_mode);
          let _ = fs::set_permissions(&c, perm);
        }
      }
      // macOS Gatekeeper quarantine: try to drop attribute, best-effort
      #[cfg(target_os = "macos")]
      {
        let _ = Command::new("/usr/bin/xattr").arg("-d").arg("com.apple.quarantine").arg(&c).output();
      }
      return Ok(c);
    }
  }
  Err(format!("tvault-core not found. Tried: {}", tried.join(", ")))
}
