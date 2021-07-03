import { Ace } from "ace-builds";
import Fuse from "fuse.js";
import { appWindow } from "@tauri-apps/api/window";

import EditorObj from "./editorObj";
import Action from "./action";

class Spotlight {
  firstChar: boolean;
  visible: boolean;
  body: Element;
  editor: Ace.Editor;
  editorObj: EditorObj;
  spotlight: HTMLInputElement;
  spotlightWrapper: HTMLElement;
  alPlaceholder: HTMLElement;
  savedRange: Ace.Point;
  dataList: HTMLCollection;
  actionList: HTMLElement;
  alSelected: HTMLElement;
  label: Element;
  labelText: NodeListOf<HTMLElement>;
  fuse: Fuse<Action>;
  count: number;
  actionCollection: Action[];
  visibleActions: HTMLElement[];

  constructor(editorObj: EditorObj, editor: Ace.Editor) {
    this.editorObj = editorObj;
    this.editorObj.spotlight = this;
    this.editor = editor;
    this.spotlightWrapper = document.querySelector("#spotlight-wrapper");
    this.spotlight = document.querySelector("#spotlight");
    this.body = document.querySelector(".window-body");
    this.dataList = document.querySelector(".action-list").children;
    this.actionList = document.querySelector(".action-list");
    this.label = document.querySelector(".titlebar-spotlight");
    this.labelText = document.querySelectorAll(".label");
    this.actionCollection = [];
    this.visibleActions = [];
    this.count = 0;

    this.init();
  }

  init() {
    // Create event listeners

    // handle open
    document.addEventListener(
      "keydown",
      (e) => {
        if (e.ctrlKey) {
          if (e.key === "b") {
            e.preventDefault();
            if (e.shiftKey && this.editorObj.script)
              this.editorObj.script = this.editorObj.script;
            else {
              if (!this.visible) this.showSpotlight();
              else this.hideSpotlight();
            }
          } else if (e.key === "n") {
            this.editorObj.fullText = "";
            this.labelText[2].classList.add("labelHidden");
            this.labelText[1].classList.add("labelHidden");
            this.labelText[0].classList.remove("labelHidden");
          } else if (e.key === "q") {
            appWindow.close();
          }
        }
      },
      true
    );
    window.addEventListener("keypress", (e) => {
      if (!this.visible && !this.editor.isFocused()) {
        window.setTimeout(() => this.editor.focus(), 0);
        if (this.savedRange != null) {
          this.editor.moveCursorToPosition(this.savedRange);
        }
      }
    });
    document.addEventListener(
      "click",
      (event) => {
        if (!this.editorObj.isSelection) event.preventDefault();
        if (this.visible) this.hideSpotlight();
        else if (!this.editor.isFocused()) {
          window.setTimeout(() => this.editor.focus(), 0);
          if (this.savedRange != null) {
            this.editor.moveCursorToPosition(this.savedRange);
          }
        }
      },
      false
    );
    this.editor.on("blur", (cm) => {
      this.savedRange = this.editor.getCursorPosition();
    });

    this.spotlight.addEventListener("keyup", (e) => {
      if (e.key == "Enter") {
        e.preventDefault();
        e.stopPropagation();
        this.editorObj.script = this.alSelected.getAttribute("name");
        this.hideSpotlight();
      } else if (e.key === "Escape") this.hideSpotlight();
    });
    this.spotlight.addEventListener("keydown", (e) => {
      if (!this.visibleActions) return;
      let i = Array.prototype.indexOf.call(
        this.visibleActions,
        this.alSelected
      );

      if (e.key === "ArrowDown") {
        e.preventDefault();
        if (i < this.visibleActions.length - 1) {
          this.selected = this.visibleActions[i + 1];
        }
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (i > 0) {
          this.selected = this.visibleActions[i - 1];
        }
      }
    });
    this.spotlight.addEventListener("input", this.search.bind(this));
    this.spotlight.addEventListener("click", (e) => {
      e.stopPropagation();
    });
    this.label.addEventListener("click", (e) => {
      if (!this.visible) {
        this.showSpotlight();
        e.stopPropagation();
      }
    });
    // build action list collection
    this.fuse = new Fuse(this.actionCollection, {
      includeScore: true,
      keys: [
        {
          name: "name",
          weight: 0.9,
        },
        {
          name: "tags",
          weight: 0.6,
        },
        {
          name: "desc",
          weight: 0.2,
        },
      ],
    });

    // create placeholder
    let listItem = document.createElement("li");
    listItem.innerHTML = "<div>No match found</div>";
    listItem.setAttribute("id", "action-list-placeholder");
    listItem.classList.add("hidden");
    this.actionList.appendChild(listItem);
    this.alPlaceholder = listItem;
  }

  get selected(): HTMLElement {
    return this.alSelected;
  }

  set selected(elem: HTMLElement) {
    if (this.alSelected) this.alSelected.classList.remove("selected");
    this.alSelected = elem;
    if (elem == null) return;
    if (!elem.classList.contains("hiddens")) {
      let y = elem.offsetTop;
      let top = this.actionList.scrollTop;
      let viewport = top + this.actionList.offsetHeight;
      if (y - 56 < top || y > viewport) this.actionList.scrollTop = y - 56;
    }
    elem.classList.add("selected");
  }

  hideSpotlight() {
    this.spotlightWrapper.classList.add("hidden");
    this.body.classList.remove("shaded");
    window.setTimeout(() => this.spotlight.focus(), 0);
    if (this.savedRange != null) {
      this.editor.moveCursorToPosition(this.savedRange);
    }
    this.visible = false;
    this.labelText[2].classList.add("labelHidden");
    if (this.labelText[1].classList.contains("labelHidden"))
      this.labelText[0].classList.remove("labelHidden");
  }

  showSpotlight() {
    this.spotlightWrapper.classList.remove("hidden");
    this.body.classList.add("shaded");
    this.spotlight.value = "";
    this.savedRange = this.editor.getCursorPosition();
    for (let i = 0; i < this.dataList.length; i++)
      this.dataList[i].classList.add("hidden");
    window.setTimeout(() => this.spotlight.focus(), 0);
    this.visible = true;
    this.label.classList.remove("postInfo");
    this.label.classList.remove("postError");
    this.labelText[2].classList.remove("labelHidden");
    this.labelText[1].classList.add("labelHidden");
    this.labelText[0].classList.add("labelHidden");
  }

  search() {
    let query = this.spotlight.value;

    this.visibleActions = [];
    for (let i = 0; i < this.dataList.length; i++)
      this.dataList[i].classList.add("hidden");

    if (query == "" || query.length > 20) {
      return;
    }

    if (query == "*") {
      for (let i in this.actionCollection) {
        let currentDom = this.actionCollection[i].dom;
        currentDom.classList.remove("hidden");
        currentDom.style.order = i;
        this.visibleActions.push(currentDom);
      }
    }

    const searchResult = this.fuse.search(query).filter((e) => e.score < 0.4);

    for (let i in searchResult) {
      let currentDom = searchResult[i].item.dom;
      currentDom.classList.remove("hidden");
      currentDom.style.order = i;
      this.visibleActions.push(currentDom);
    }

    if (this.visibleActions.length > 0) {
      this.selected = this.visibleActions[0];
      this.alPlaceholder.classList.add("hidden");
    } else {
      this.selected = null;
      this.alPlaceholder.classList.remove("hidden");
    }
  }

  addAction(name: string, desc: string, icon: string, tags: string) {
    let listItem = document.createElement("li");
    listItem.innerHTML = `<div><i class="${icon}-icon listIcon"></i><div>
                                <Name>${name}</Name>
                                <description>${desc}</description>
                                </div></div>`;
    listItem.setAttribute("name", name);
    listItem.onclick = () => (this.editorObj.script = name);
    listItem.onmouseover = () => (this.selected = listItem);
    this.actionList.appendChild(listItem);
    this.count++;
    this.fuse.add(new Action(name, desc, icon, listItem));
  }

  Ok() {
    // * Script has finished execution, return.
    this.hideSpotlight();
  }
}

export default Spotlight;
