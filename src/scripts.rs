use rust_embed::RustEmbed;
use directories::UserDirs;
use glob::glob;
use std::fs::{read_to_string, create_dir_all};
use tinyfiledialogs::{message_box_ok, MessageBoxIcon};

use web_view::{WebView, WVResult};

use serde::{Deserialize, Serialize};

use serde_json;

use std::collections::HashMap;

#[derive(RustEmbed)]
#[folder = "src/scripts/"]
pub struct Asset;

#[derive(Serialize, Deserialize)]
struct Metadata {
    api: i16,
    name: String,
    description: String,
    author: String,
    icon: String,
    tags: String
}

pub struct Script {
    metadata: Metadata,
    string: String
}

impl Script {
    fn new(string: &str) -> Result<Script, serde_json::error::Error>{
        let start_bytes = string.find("/**").unwrap_or(0) + 3;
        let end_bytes = string.find("**/").unwrap_or(string.len());
        match parse_meta(&string[start_bytes..end_bytes]) {
            Err(msg) => {
                Err(msg)
            }
            Ok(meta) => {
                Ok(Script {
                    metadata: meta,
                    string: string.to_string()
                })
            }
        }
    }
}


fn parse_meta(string: &str) -> serde_json::Result<Metadata>{
    serde_json::from_str(&string)
}

fn append_script(webview: &mut WebView<()>, script_list: &mut HashMap<String, Script>, script_string: &str, file_name: &str) -> WVResult{
    match Script::new(script_string) {
        Err(msg) => {
            message_box_ok("Script parsing error",
                &format!("File: {}\n{:?}", file_name, msg),
                MessageBoxIcon::Warning);
            Ok(())
        }
        Ok(val) => {
            let meta = &val.metadata;
            webview.eval(&format!("spotlight.spotlightActions.addAction({:?}, {:?}, {:?}, {:?})",
                meta.name, meta.description, meta.icon, meta.tags))?;
            script_list.insert(meta.name.to_string(), val);
            Ok(())
        }
    }
    
}

pub fn build_scripts(webview: &mut WebView<()>, script_list: &mut HashMap<String, Script>) -> WVResult{
    for script in Asset::iter() {
        let file = &Asset::get(script.as_ref()).unwrap();
        let script_string: &str = std::str::from_utf8(file.as_ref()).unwrap();
        append_script(webview, script_list, script_string, script.as_ref())?
    }
    if let Some(user_dir) = UserDirs::new() {
        let bloop_dir = user_dir.document_dir().unwrap().join("bloop");
        if bloop_dir.exists() {
            let script_path = &bloop_dir.join("**").join("*.js");
            for script in glob(script_path.to_str().unwrap()).unwrap(){
                let file = script.unwrap();
                let script_string = read_to_string(&file).unwrap();
                append_script(webview, script_list, &script_string, &file.to_str().unwrap())?
            }
        }
        else {
            create_dir_all(bloop_dir).unwrap();
        }
    }
    
    webview.eval("spotlight.spotlightActions.finalize()")?;
    Ok(())
}

pub fn script_eval(script_obj: &Script, webview: &mut WebView<()>) -> WVResult {
    let js = format!("{}; main(editorObj);", &script_obj.string);
    webview.eval(&js)?;
    webview.eval("spotlight.spotlightActions.Ok()")?;
    Ok(())
}