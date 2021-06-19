import { appWindow } from "@tauri-apps/api/window";

class TitleBar {
  titlebar: HTMLElement;
  close: HTMLElement;
  minimize: HTMLElement;
  maximize: HTMLElement;
  fullscreenSvg: HTMLElement;
  maximizeSvg: HTMLElement;
  maximizeState: boolean;

  constructor() {
    this.close = document.querySelector(".titlebar-close");
    this.minimize = document.querySelector(".titlebar-minimize");
    this.maximize = document.querySelector(".titlebar-fullscreen");
    this.fullscreenSvg = document.querySelector(".fullscreen-svg");
    this.maximizeSvg = document.querySelector(".fullscreen-svg");
    this.titlebar = document.querySelector(".titlebar");
    this.maximizeState = false;

    this.init();
  }

  maximizeEvent() {
    if (this.maximizeState) {
      this.fullscreenSvg.classList.remove("hidden");
      this.maximizeSvg.classList.add("hidden");
      this.maximizeState = false;
      appWindow.unmaximize();
    } else {
      this.maximizeSvg.classList.remove("hidden");
      this.fullscreenSvg.classList.add("hidden");
      this.maximizeState = true;
      appWindow.maximize();
    }
  }

  init() {
    this.close.onclick = (e) => {
      e.stopPropagation();
      appWindow.close();
    };
    this.minimize.onclick = (e) => {
      appWindow.minimize();
      e.stopPropagation();
    };
    this.maximize.onclick = (e) => this.maximizeEvent();
    this.titlebar.ondblclick = () => this.maximizeEvent();
  }
}

export default TitleBar;
