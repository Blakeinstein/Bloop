use std::collections::HashMap;
use std::error::Error;
use std::fs::{create_dir_all, read_to_string, File as FileWriter};
use std::io::Write;

use config::{Config, File, FileFormat};
use serde::{Deserialize, Serialize};
use tauri::api::dialog::message;
use tauri::api::path::config_dir;

#[derive(Debug, Serialize, Deserialize)]
pub struct Global {
  pub custom_css: String,
  pub width: u32,
  pub height: u32,
  pub always_on_top: bool,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct BloopConfig {
  pub global: Global,
  pub vars: HashMap<String, String>,
}

impl BloopConfig {
  pub fn new() -> Result<Self, Box<dyn Error>> {
    let mut settings = Config::default();
    const DEFAULT_CONFIG: &'static str = include_str!("../config/default.toml");
    if let Err(err) = settings.merge(File::from_str(DEFAULT_CONFIG, FileFormat::Toml)) {
      message(Option::<&tauri::Window<tauri::Wry>>::None, "Error parsing default config", err.to_string());
    }
    if let Some(config_path) = config_dir() {
      let config_dir = config_path.join("bloop");
      let bloop_config = config_dir.join("config.toml");
      if config_dir.exists() && bloop_config.exists() {
        if let Err(err) = settings.merge(File::from(bloop_config)) {
          message(Option::<&tauri::Window<tauri::Wry>>::None, "Error parsing config", err.to_string());
        }
      } else {
        create_dir_all(config_dir)?;
        let mut file = FileWriter::create(bloop_config)?;
        file.write_all(DEFAULT_CONFIG.as_bytes())?;
      }
    }
    settings.try_into().map_err(|err| err.into())
  }
}

pub fn custom_css(css_file_name: String) -> Option<String> {
  if let Some(config_path) = config_dir() {
    let css_file = config_path
      .join("bloop/themes")
      .join(css_file_name + ".css");
    if css_file.exists() {
      return Some(read_to_string(&css_file).unwrap());
    }
  }
  None
}
