import ace from "ace-builds";
import "ace-builds/src-min-noconflict/keybinding-sublime";
import "./bloopMode";

const EditorElement: HTMLElement = document.querySelector(".editor-container");

const Config: Record<string, any> = {
  cursorStyle: "ace",
  fontFamily: `var(--font)`,
  fontSize: `var(--editor_font_size)`,
  useWorker: false,
  indentedSoftWrap: false,
  wrap: true,
  hScrollBarAlwaysVisible: false,
  vScrollBarAlwaysVisible: false,
  autoScrollEditorIntoView: true,
  showPrintMargin: false,
};

const editor = ace.edit(EditorElement);
editor.setOptions(Config);
editor.setKeyboardHandler("ace/keyboard/sublime");
editor.session.setMode("ace/mode/bloop");

editor.setValue(localStorage.getItem("bloopTextData") ?? "");

window.addEventListener("drop", (e) => {
  e.preventDefault();

  for (let i in e.dataTransfer.files) {
    let reader = new FileReader();
    reader.onload = (ev) => {
      editor.setValue(ev.target.result as string);
    };
    reader.readAsText(e.dataTransfer.files[i]);
  }
});

window.addEventListener("dragover", (e) => {
  e.preventDefault();
});

export default editor;
