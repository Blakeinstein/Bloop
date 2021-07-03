use std::collections::HashMap;

use config::{Config, ConfigError, File};
use serde::{Deserialize, Serialize};
use tauri::api::dialog::message;
use tauri::api::path::document_dir;

#[derive(Debug, Serialize, Deserialize)]
pub struct Global {
  pub custom_css: bool,
  pub width: u32,
  pub height: u32,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct BloopConfig {
  pub global: Global,
  pub vars: HashMap<String, String>,
}

impl BloopConfig {
  pub fn new() -> Result<Self, ConfigError> {
    let mut settings = Config::default();
    if let Err(err) = settings.merge(File::with_name("config/default")) {
      message("Error parsing default config", err.to_string());
    }
    if let Some(document_path) = document_dir() {
      let bloop_config = document_path.join("bloop").join("config.toml");
      if bloop_config.exists() {
        if let Err(err) = settings.merge(File::from(bloop_config)) {
          message("Error parsing config", err.to_string());
        }
      }
    }
    settings.try_into()
  }
}
