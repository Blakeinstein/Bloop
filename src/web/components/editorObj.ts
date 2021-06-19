import { invoke } from "@tauri-apps/api/tauri";
import { Editor } from "codemirror";
import Spotlight from "./spotlight";

class EditorObj {
  _script: String;
  editor: Editor;
  spotlight: Spotlight;

  constructor(editor: Editor) {
    this.editor = editor;
  }

  get script() {
    return this._script;
  }
  get isSelection() {
    return this.editor.somethingSelected();
  }
  get fullText() {
    return this.editor.getValue();
  }
  get text() {
    return this.isSelection ? this.selection : this.fullText;
  }
  get selection() {
    return this.editor.getSelection();
  }

  set script(value) {
    this._script = value;
    invoke("exec", { scriptName: value }).catch((error) =>
      this.postError(error)
    );
  }
  set selection(value) {
    this.editor.replaceSelection(value);
  }
  set fullText(value) {
    this.editor.setValue(value);
  }
  set text(value) {
    if (this.isSelection) this.selection = value;
    else this.fullText = value;
  }

  focus() {
    this.editor.focus();
    this.editor.setCursor(this.editor.lineCount(), 0);
  }

  postMessage(message) {
    this.spotlight.labelText[1].innerText = message;
    this.spotlight.labelText[0].classList.add("labelHidden");
    this.spotlight.labelText[1].classList.remove("labelHidden");
  }

  postInfo(message) {
    this.postMessage(message);
    this.spotlight.label.classList.add("postInfo");
  }

  postError(message) {
    this.postMessage(message);
    this.spotlight.labelText[1].classList.remove("labelHidden");
    this.spotlight.label.classList.add("postError");
  }
}

export default EditorObj;
