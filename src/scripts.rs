use glob::glob;
use std::fs::{create_dir_all, read_to_string};

use tauri::api::path::{document_dir, resource_dir};
use tauri::Window;

use serde::{Deserialize, Serialize};

use serde_json;

use std::collections::HashMap;

#[derive(Serialize, Deserialize)]
struct Metadata {
  api: i16,
  name: String,
  description: String,
  author: String,
  icon: String,
  tags: String,
}

pub struct Script {
  metadata: Metadata,
  string: String,
}

impl Script {
  fn new(string: &str) -> Result<Script, serde_json::error::Error> {
    let start_bytes = string.find("/**").unwrap_or(0) + 3;
    let end_bytes = string.find("**/").unwrap_or(string.len());
    match parse_meta(&string[start_bytes..end_bytes]) {
      Err(msg) => Err(msg),
      Ok(meta) => Ok(Script {
        metadata: meta,
        string: string.to_string(),
      }),
    }
  }
}

fn parse_meta(string: &str) -> serde_json::Result<Metadata> {
  serde_json::from_str(&string)
}

fn append_script(
  window: &Window,
  script_list: &mut HashMap<String, Script>,
  script_string: &str,
) -> tauri::Result<()> {
  match Script::new(script_string) {
    Err(_) => Ok(()),
    Ok(val) => {
      let meta = &val.metadata;
      window.eval(&format!(
        "spotlight.spotlightActions.addAction({:?}, {:?}, {:?}, {:?})",
        meta.name, meta.description, meta.icon, meta.tags
      ))?;
      script_list.insert(meta.name.to_string(), val);
      Ok(())
    }
  }
}

pub fn build_scripts(
  window: Window,
  script_list: &mut HashMap<String, Script>,
) -> tauri::Result<()> {
  let config = tauri::generate_context!();
  if let Some(resource_dir) = resource_dir(config.package_info()) {
    dbg!(&resource_dir);
    let script_path = &resource_dir.join("scripts").join("**").join("*.js");
    install_scripts(&window, script_list, script_path.to_str().unwrap())?;
  }
  if let Some(user_dir) = document_dir() {
    let bloop_dir = user_dir.join("bloop");
    if bloop_dir.exists() {
      let script_path = &bloop_dir.join("**").join("*.js");
      install_scripts(&window, script_list, script_path.to_str().unwrap())?;
    } else {
      create_dir_all(bloop_dir).unwrap();
    }
  }

  window.eval("spotlight.spotlightActions.finalize()")?;
  Ok(())
}

pub fn install_scripts(
  window: &Window,
  script_list: &mut HashMap<String, Script>,
  pattern: &str,
) -> tauri::Result<()> {
  for script in glob(pattern).unwrap() {
    let file = script.unwrap();
    let script_string = read_to_string(&file).unwrap();
    append_script(window, script_list, &script_string)?;
  }
  Ok(())
}

pub fn script_eval(script_obj: &Script, window: &Window) -> tauri::Result<()> {
  let js = format!("{}; main(editorObj);", &script_obj.string);
  window.eval(&js)?;
  window.eval("spotlight.spotlightActions.Ok()")?;
  Ok(())
}
