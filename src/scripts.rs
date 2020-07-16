use rust_embed::RustEmbed;

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
    fn new(string: &str) -> Script{
        let start_bytes = string.find("/**").unwrap_or(0) + 3;
        let end_bytes = string.find("**/").unwrap_or(string.len());
        Script {
            metadata: parse_meta(&string[start_bytes..end_bytes]).unwrap(),
            string: string.to_string()
        }
    }
}

// static mut script_list: HashMap<String, Script> = HashMap::new();

fn parse_meta(string: &str) -> serde_json::Result<Metadata>{
    let value: Metadata = serde_json::from_str(&string)?;
    Ok(value)
}

pub fn build_scripts(webview: &mut WebView<()>, script_list: &mut HashMap<String, Script>) -> WVResult{
    for script in Asset::iter() {
        let file = &Asset::get(script.as_ref()).unwrap();
        let script_string: &str = std::str::from_utf8(file.as_ref()).unwrap();
        let script = Script::new(script_string);
        let meta = &script.metadata;

        webview.eval(&format!("spotlight.spotlightActions.addAction({:?}, {:?}, {:?}, {:?})",
            meta.name, meta.description, meta.icon, meta.tags))?;
        script_list.insert(script.metadata.name.to_string(), script);
    }
    webview.eval("spotlight.spotlightActions.finalize()")?;
    Ok(())
}

pub fn script_eval(script_obj: &Script, webview: &mut WebView<()>) -> WVResult {
    let script_str: &str = &script_obj.string;
    let js = format!("{}; main(editorObj);", &script_str);
    webview.eval(&js)
}