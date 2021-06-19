import "./code-mirror/mode";
import "codemirror/keymap/sublime";

import CodeMirror from "codemirror";

const EditorElement: HTMLElement = document.querySelector(".window-body");

const Config: CodeMirror.EditorConfiguration = {
  scrollbarStyle: null,
  electricChars: false,
  lineWrapping: true,
  autofocus: true,
  lineNumbers: true,
  keyMap: "sublime",
  extraKeys: {
    Tab: (cm) => {
      CodeMirror.commands[cm.somethingSelected() ? "indentMore" : "insertTab"](
        cm
      );
    },
  },
  mode: "bloop",
};

export const editor = CodeMirror(EditorElement, Config);
