#[cfg(windows)]
extern crate winres;

fn main() {
  tauri_build::build()
}
