#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]
mod scripts;
use std::collections::HashMap;
use std::sync::{Arc, Mutex};

#[derive(Default)]
struct Scripts(Arc<Mutex<HashMap<String, scripts::Script>>>);

#[tauri::command]
fn doc_ready(window: tauri::Window, scripts: tauri::State<Scripts>) -> Result<String, String> {
  match scripts::build_scripts(window, &mut scripts.0.lock().unwrap()) {
    Ok(_) => Ok("".to_string()),
    Err(err) => Err(err.to_string()),
  }
}

#[tauri::command]
fn exec(
  window: tauri::Window,
  scripts: tauri::State<Scripts>,
  script_name: String,
) -> Result<String, String> {
  match scripts::script_eval(
    scripts
      .0
      .lock()
      .unwrap()
      .get(&script_name)
      .ok_or(format!("Script, {}, not found", &script_name))?,
    &window,
  ) {
    Ok(_) => Ok("".to_string()),
    Err(err) => Err(err.to_string()),
  }
}

fn main() {
  let context = tauri::generate_context!();
  scripts::PACKAGE_INFO
    .set(context.package_info().clone())
    .unwrap();
  tauri::Builder::default()
    .manage(Scripts(Default::default()))
    .invoke_handler(tauri::generate_handler![doc_ready, exec])
    .run(context)
    .expect("error while running tauri application");
}
