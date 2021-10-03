#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]
mod scripts;
mod settings;

extern crate config;
extern crate serde;

use once_cell::sync::OnceCell;
use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use tauri::Manager;

pub static PACKAGE_INFO: OnceCell<tauri::PackageInfo> = OnceCell::new();
pub static GLOBAL_CONFIG: OnceCell<settings::BloopConfig> = OnceCell::new();

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

#[tauri::command]
fn require(scripts: tauri::State<Scripts>, script_name: String) -> Result<String, String> {
  match scripts.0.lock().unwrap().get(&script_name) {
    Some(script) => Ok(script.string.clone()),
    None => Err("lib not found".into()),
  }
}

#[tauri::command]
fn settings() -> Result<String, String> {
  let config = GLOBAL_CONFIG.get().ok_or("Error reading config")?;
  serde_json::to_string(config).map_err(|err| err.to_string())
}

#[tauri::command]
fn custom_css() -> String {
  let config = GLOBAL_CONFIG.get().unwrap();
  settings::custom_css(config.global.custom_css.clone()).unwrap_or_default()
}

fn main() {
  let context = tauri::generate_context!();
  PACKAGE_INFO.set(context.package_info().clone()).unwrap();
  let app_config = settings::BloopConfig::new().unwrap();
  const MIN_SIZE: tauri::Size = tauri::Size::Physical(tauri::PhysicalSize {
    width: 900,
    height: 400,
  });
  let width = app_config.global.width;
  let height = app_config.global.height;
  let always_on_top = app_config.global.always_on_top;
  GLOBAL_CONFIG.set(app_config).unwrap();

  tauri::Builder::default()
    .setup(move |app| {
      let window = app.get_window("main").unwrap();
      window.set_min_size(Some(MIN_SIZE)).unwrap();
      window
        .set_size(tauri::Size::Physical(tauri::PhysicalSize { width, height }))
        .unwrap();
      window
        .set_always_on_top(always_on_top)
        .unwrap();
      Ok(())
    })
    .manage(Scripts(Default::default()))
    .invoke_handler(tauri::generate_handler![
      doc_ready, exec, require, settings, custom_css
    ])
    .run(context)
    .expect("error while running tauri application");
}
