use rust_embed::RustEmbed;

use web_view::{WebView, WVResult};

#[derive(RustEmbed)]
#[folder = "src/scripts/"]
pub struct Asset;

pub fn script_eval(arg: &str, webview: &mut WebView<()>) -> WVResult {
    let script_str: &str;
    match Asset::get(&arg) {
        Some(content) => {
            script_str = std::str::from_utf8(&content.as_ref()).unwrap();
            let js = format!("{}; main(editorObj);", &script_str);
            webview.eval(&js)
        },
        None => {
            // panic!();
            println!("Error: File Not Found");
            webview.eval("Alert('Programmer made a fucky-wucky');")
        }
    }
    // const TEST: &str = r#"
    //     function main(input) {
    //         var split = input.text.split(/\r\n|\r|\n/)
    //         input.postInfo(split.length + 'lines collapsed')
    //         input.fullText = split.join()
    //     };
    //     main(editorObj);
    // "#;

    // webview.eval(&TEST)
}