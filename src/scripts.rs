use rust_embed::RustEmbed;

#[derive(RustEmbed)]
#[folder = "src/scripts/"]
pub struct Asset;