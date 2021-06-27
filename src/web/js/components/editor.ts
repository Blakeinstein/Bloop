import ace from "ace-builds";
import "ace-builds/src-min-noconflict/keybinding-sublime";
import "./bloopMode";

const EditorElement: HTMLElement = document.querySelector(".window-body");

const Config: Record<string, any> = {
  cursorStyle: "ace",
  fontFamily: `var(--font)`,
  fontSize: `var(--editor-font-size)`,
  useWorker: false,
  indentedSoftWrap: false,
  wrap: true,
  hScrollBarAlwaysVisible: false,
  vScrollBarAlwaysVisible: false,
  autoScrollEditorIntoView: true,
};

const editor = ace.edit(EditorElement);
editor.setOptions(Config);
editor.setKeyboardHandler("ace/keyboard/sublime");
editor.session.setMode("ace/mode/bloop");

export default editor;
