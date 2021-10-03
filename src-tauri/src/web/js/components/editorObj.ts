import { invoke } from "@tauri-apps/api/tauri";
import { Ace } from "ace-builds";
import Spotlight from "./spotlight";

class EditorObj {
  _script: String;
  editor: Ace.Editor;
  spotlight: Spotlight;

  constructor(editor: Ace.Editor) {
    this.editor = editor;
  }

  get script() {
    return this._script;
  }
  get isSelection() {
    return !this.editor.getSelection().isEmpty();
  }
  get fullText() {
    return this.editor.getValue();
  }
  get text() {
    return this.isSelection ? this.selection : this.fullText;
  }
  get selection() {
    return this.editor.getSelectedText();
  }

  set script(value) {
    this._script = value;
    invoke("exec", { scriptName: value }).catch((error) =>
      this.postError(error)
    );
  }
  set selection(value) {
    let range = this.editor.getSelection().getRange();
    this.editor.session.replace(range, value);
  }
  set fullText(value) {
    this.editor.setValue(value);
    this.editor.clearSelection();
  }
  set text(value) {
    if (this.isSelection) this.selection = value;
    else this.fullText = value;
  }

  focus() {
    this.editor.focus();
    this.editor.navigateFileEnd();
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
