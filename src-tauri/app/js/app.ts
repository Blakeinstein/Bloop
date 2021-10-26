import { invoke } from "@tauri-apps/api/tauri";
import { appWindow, PhysicalSize, PhysicalPosition } from '@tauri-apps/api/window'
import { Ace } from "ace-builds";

import editor from "./components/editor";
import Spotlight from "./components/spotlight";
import EditorObj from "./components/editorObj";
import TitleBar from "./components/titlebar";
import Settings from "./components/settings";

declare global {
  interface Window {
    editor: Ace.Editor;
    editorObj: EditorObj;
    titlebar: TitleBar;
    spotlight: Spotlight;
    settings: Settings;
    requireMod: Function;
  }
}
window.settings = new Settings();

window.editor = editor;

window.titlebar = new TitleBar();

window.editorObj = new EditorObj(editor);
// * Implement Spotlight
window.spotlight = new Spotlight(window.editorObj, editor);

window.requireMod = async (path: string) => {
  if (!path.endsWith(".js")) path += ".js";
  try {
    const code = await invoke("require", { scriptName: path });
    const func = new Function(
      `let exports = {}; const module = { exports }; ${code}; return module.exports;`
    );
    return func();
  } catch (err) {
    window.editorObj.postError(err);
  }
};

window.onload = () => {
  invoke("doc_ready");
  window.editorObj.focus();
};

type coords = [number, number];

try {
  const lastSize = JSON.parse(localStorage.getItem("bloopWindowSize")) as coords;
  if (lastSize) {
    lastSize[0] = Math.max(lastSize[0], 50);
    lastSize[1] = Math.max(lastSize[1], 50);
    appWindow.setSize(new PhysicalSize(...lastSize));
  }
  
  const currPosition = JSON.parse(localStorage.getItem("bloopWindowPosition")) as coords;
  if (currPosition)
    appWindow.setPosition(new PhysicalPosition(...currPosition));
  else
    appWindow.center();
} catch(err) {
  console.log(err);
}

setInterval( async () => {
  const currSize = await appWindow.innerSize();
  const currPosition = await appWindow.innerPosition();
  localStorage.setItem("bloopTextData", window.editor.getValue());
  localStorage.setItem("bloopWindowSize", JSON.stringify([currSize.width, currSize.height]));
  localStorage.setItem("bloopWindowPosition", JSON.stringify([currPosition.x, currPosition.y]));
}, 5000);