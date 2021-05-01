#[cfg(windows)]
extern crate winres;

#[cfg(windows)]
fn main() {
  if cfg!(target_os = "windows") {
    let mut res = winres::WindowsResource::new();
    res.set_icon("assets/Icon.ico");
    res.compile().unwrap();
  }
}

#[cfg(not(windows))]
fn main() {}