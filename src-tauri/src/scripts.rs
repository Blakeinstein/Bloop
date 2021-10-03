use glob::{glob, GlobError};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::fs::{create_dir_all, read_to_string};
use std::path::PathBuf;
use tauri::api::path::{document_dir, resource_dir};
use tauri::Window;

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
  pub string: String,
}

impl Script {
  fn new(string: &str) -> Result<Script, serde_json::error::Error> {
    let start_bytes = string.find("/**").map(|x| x+3);
    let end_bytes = string.find("**/");
    parse_meta(&string[start_bytes.unwrap_or(0)..end_bytes.unwrap_or(0)])
      .map(|meta| Script {
        metadata: meta,
        string: string.to_string().replace("require(", "await requireMod(")
      }
    )
  }
}

fn parse_meta(string: &str) -> serde_json::Result<Metadata> {
  serde_json::from_str(&string)
}

fn append_script(
  window: &Window,
  script_list: &mut HashMap<String, Script>,
  script: Result<&PathBuf, &GlobError>,
) -> tauri::Result<()> {
  let file = script.unwrap();
  let script_string = read_to_string(&file).unwrap();
  match Script::new(&script_string) {
    Err(_) => Ok(()),
    Ok(val) => {
      let meta = &val.metadata;
      window.eval(&format!(
        "spotlight.addAction({:?}, {:?}, {:?}, {:?})",
        meta.name, meta.description, meta.icon, meta.tags
      ))?;
      script_list.insert(meta.name.to_string(), val);
      Ok(())
    }
  }
}

fn append_lib(
  script_list: &mut HashMap<String, Script>,
  script: Result<&PathBuf, &GlobError>,
  builtin: bool,
) -> tauri::Result<()> {
  let file = script.unwrap();
  let script_string = read_to_string(&file).unwrap();
  let file_name = file.file_name().unwrap().to_str().unwrap();
  let lib = Script {
    metadata: Metadata {
      api: 1,
      name: if builtin {
        String::from("@boop/") + file_name
      } else {
        String::from("lib/") + file_name
      },
      description: "Is lib".into(),
      author: "Is lib".into(),
      icon: "Is lib".into(),
      tags: "lib".into(),
    },
    string: script_string.to_string(),
  };
  script_list.insert(lib.metadata.name.to_string(), lib);
  Ok(())
}

pub fn build_scripts(
  window: Window,
  script_list: &mut HashMap<String, Script>,
) -> tauri::Result<()> {
  script_list.clear(); // flush scripts on reload
  if let Some(resource_dir) = resource_dir(&crate::PACKAGE_INFO.get().unwrap()) {
    let script_path = &resource_dir.join("scripts");
    install_scripts(&window, script_list, script_path, true)?;
  }
  if let Some(user_dir) = document_dir() {
    let bloop_dir = user_dir.join("bloop");
    if bloop_dir.exists() {
      install_scripts(&window, script_list, &bloop_dir, false)?;
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
  pattern: &PathBuf,
  builtin: bool,
) -> tauri::Result<()> {
  for script in glob(pattern.join("*.js").to_str().unwrap()).unwrap() {
    append_script(window, script_list, script.as_ref())?;
  }
  for script in glob(pattern.join("lib").join("*.js").to_str().unwrap()).unwrap() {
    append_lib(script_list, script.as_ref(), builtin)?;
  }
  Ok(())
}

pub fn script_eval(script_obj: &Script, window: &Window) -> tauri::Result<()> {
  let js = format!(
    "(async () => {{ {}; main(editorObj) }})()",
    &script_obj.string
  );
  window.eval(&js)?;
  window.eval("spotlight.spotlightActions.Ok()")?;
  Ok(())
}
