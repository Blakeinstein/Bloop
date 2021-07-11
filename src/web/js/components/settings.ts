import { invoke } from "@tauri-apps/api/tauri";
import { open } from "@tauri-apps/api/shell";
import { documentDir } from "@tauri-apps/api/path";
class Settings {
  root: HTMLElement;
  settingsButton: HTMLElement;
  cssElement: HTMLStyleElement;

  constructor() {
    this.root = document.documentElement;
    this.cssElement = document.createElement("style") as HTMLStyleElement;
    document.head.append(this.cssElement);
    this.settingsButton = document.querySelector(".titlebar-settings");
    this.settingsButton.addEventListener("click", this.openSettingsFile);
    invoke("settings").then(
      (config) => this.updateConfig(config as string),
      (err) => console.log(err)
    );
    document.body.style.display = "initial";
  }
  updateConfig(config: string) {
    let settings: Record<string, any> = JSON.parse(config);
    Object.entries(settings["vars"] as Record<string, string>).forEach(
      ([prop, value]) => {
        this.root.style.setProperty("--" + prop, value);
      }
    );
    if (settings["global"]["custom_css"]) {
      invoke("custom_css").then(
        (css) => (this.cssElement.textContent = css as string),
        (err) => console.log(err)
      );
    }
  }
  openSettingsFile() {
    documentDir()
      .then((dir) => open(dir + "bloop/config.toml"))
      .catch((err) => console.log(err));
  }
}

export default Settings;
