use std::collections::HashMap;
use std::error::Error;
use std::fs::File as FileWriter;
use std::io::Write;

use config::{Config, File};
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
  pub fn new() -> Result<Self, Box<dyn Error>> {
    let mut settings = Config::default();
    const DEFAULT_CONFIG: &[u8] = include_bytes!("../config/default.toml");
    if let Err(err) = settings.merge(File::with_name("config/default")) {
      message("Error parsing default config", err.to_string());
    }
    if let Some(document_path) = document_dir() {
      let bloop_config = document_path.join("bloop").join("config.toml");
      if bloop_config.exists() {
        if let Err(err) = settings.merge(File::from(bloop_config)) {
          message("Error parsing config", err.to_string());
        }
      } else {
        let mut file = FileWriter::create(bloop_config)?;
        file.write_all(DEFAULT_CONFIG)?;
      }
    }
    settings.try_into().map_err(|err| err.into())
  }
}
