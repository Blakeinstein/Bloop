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
    this.maximizeSvg = document.querySelector(".maximize-svg");
    this.titlebar = document.querySelector(".titlebar");
    this.maximizeState = false;

    this.init();
  }

  maximizeEvent() {
    this.maximizeState = !this.maximizeState;
    this.fullscreenSvg.classList.toggle("hidden");
    this.maximizeSvg.classList.toggle("hidden");
    this.maximizeState ? appWindow.unmaximize() : appWindow.maximize();
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
