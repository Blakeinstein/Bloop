import { invoke } from "@tauri-apps/api/tauri";
import { Editor } from "codemirror";

import { editor } from "./components/editor";
import Spotlight from "./components/spotlight";
import EditorObj from "./components/editorObj";
import TitleBar from "./components/titlebar";

declare global {
  interface Window {
    editor: Editor;
    editorObj: EditorObj;
    titlebar: TitleBar;
    spotlight: Spotlight;
    requireMod: Function;
  }
}

window.editor = editor;

window.titlebar = new TitleBar();

window.editorObj = new EditorObj(editor);
// * Implement Spotlight
window.spotlight = new Spotlight(editorObj, editor);

window.requireMod = async (path: string) => {
  if (!path.endsWith(".js")) path += ".js";
  try {
    const code = await invoke("require", { scriptName: path });
    const func = new Function(
      `let exports = {}; const module = { exports }; ${code}; return module.exports;`
    );
    return func();
  } catch (err) {
    editorObj.postError(err);
  }
};

window.addEventListener("dragover", (e) => {
  e.preventDefault();
});
window.addEventListener("drop", (e) => {
  e.preventDefault();

  for (let i in e.dataTransfer.files) {
    let reader = new FileReader();
    reader.onload = (ev) => {
      editor.replaceSelection(ev.target.result as string, "end");
    };
    reader.readAsText(e.dataTransfer.files[i]);
  }
});

window.onload = () => {
  invoke("doc_ready");
  editorObj.focus();
};
