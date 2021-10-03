import { invoke } from "@tauri-apps/api/tauri";
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
