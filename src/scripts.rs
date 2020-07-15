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

fn parse_meta(string: &str) -> serde_json::Result<Metadata>{
    let value: Metadata = serde_json::from_str(&string)?;
    Ok(value)
}

pub fn build_scripts(webview: &mut WebView<HashMap<String, Script>>){
    let script_list = webview.user_data_mut();
    for script in Asset::iter() {
        let file = &Asset::get(script.as_ref()).unwrap();
        let script_string: &str = std::str::from_utf8(file.as_ref()).unwrap();
        script_list.insert(script.as_ref().to_string(), Script::new(script_string));
    }
}

pub fn script_eval(arg: &str, webview: &mut WebView<HashMap<String, Script>>) -> WVResult {
    let script_str: &str = &webview.user_data()[arg].string;
    let js = format!("{}; main(editorObj);", &script_str);
    webview.eval(&js)
}