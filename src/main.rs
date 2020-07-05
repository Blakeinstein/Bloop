extern crate web_view;

use web_view::*;

fn main() {
    let html_content = format!(include_str!("template/index.html"),
        styles = inline_style(include_str!("template/style.css")),
        scripts = inline_script(include_str!("template/app.js")),
    );
    
    let mut maximized_state = false;
    
    web_view::builder()
        .title("Bloop")
        .content(Content::Html(html_content))
        .size(750, 400)
        .frameless(true)
        .resizable(true)
        .debug(true)
        .user_data(())
        .invoke_handler(|webview, arg|  {
            match arg {
                "exit" => webview.exit(),
                "maximize" => {
                    maximized_state = !maximized_state;
                    webview.set_maximized(maximized_state);
                },
                "minimize" => {
                    webview.set_minimized();
                },
                "drag_intent" => {
                    webview.drag_intent();
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