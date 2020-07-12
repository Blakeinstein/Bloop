use rust_embed::RustEmbed;

use web_view::{WebView, WVResult};

#[derive(RustEmbed)]
#[folder = "src/scripts/"]
pub struct Asset;

pub fn script_eval(arg: &str, webview: &mut WebView<()>) -> WVResult {
    let script_str: &str;
    match Asset::get(&arg) {
        Some(content) => {
            script_str = std::str::from_utf8(content.as_ref()).unwrap();
            let js = format!("console.log({:?}); main(editorObj);", &script_str);
            println!("{}", &js);
            webview.eval(&js)
        },
        None => {
            // panic!();
            println!("Error: File Not Found");
            webview.eval("Alert('Programmer made a fucky-wucky');")
        }
    }
}