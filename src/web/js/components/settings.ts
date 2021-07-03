import { invoke } from "@tauri-apps/api/tauri";
class Settings {
  root: HTMLElement;

  constructor() {
    this.root = document.documentElement;
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
  }
  openSettingsFile() {
    invoke("open_config");
  }
}

export default Settings;
