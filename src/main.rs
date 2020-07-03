extern crate web_view;

use web_view::*;

fn main() {
    let html_content = format!(include_str!("template/index.html"),
        styles = inline_style(include_str!("template/style.css")),
        scripts = inline_script(include_str!("template/line-numbers.js")),
    );
    
    let mut fullscreen_state = false;
    
    web_view::builder()
        .title("Bloop")
        .content(Content::Html(html_content))
        .size(750, 600)
        .frameless(true)
        .resizable(true)
        .debug(true)
        .user_data(())
        .invoke_handler(|_webview, _arg|  {
            match _arg {
                "exit" => _webview.exit(),
                "maximize" => {
                    fullscreen_state = !fullscreen_state;
                    _webview.set_fullscreen(fullscreen_state);
                },
                _ => (),
            }    
            Ok(())
        })
        .run()
        .unwrap();
}

fn inline_style(s: &str) -> String {
    format!(r#"<style type="text/css">{}</style>"#, s)
}

fn inline_script(s: &str) -> String {
    format!(r#"<script type="text/javascript">{}</script>"#, s)
}