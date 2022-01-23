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
    document.addEventListener("keydown", this.startSpotlight.bind(this), true);

    window.addEventListener("keypress", () => {
      if (!this.visible && !this.editor.isFocused()) {
        this.focusEditor();
      }
    });
    
    document.addEventListener("click", this.hideSpotlight.bind(this), false);

    this.editor.on("blur", () => this.savedRange = this.editor.getCursorPosition());

    this.spotlight.addEventListener("keyup", (e) => {
      if (e.key == "Enter") {
        e.preventDefault();
        e.stopPropagation();
        this.editorObj.script = this.alSelected.getAttribute("name");
        this.hideSpotlight();
      } else if (e.key === "Escape") this.hideSpotlight();
    });
    
    this.spotlight.addEventListener("keydown", this.scrollScripts.bind(this));
    this.spotlight.addEventListener("input", this.search.bind(this));
    this.spotlight.addEventListener("click", (e) => e.stopPropagation());
    this.label.addEventListener("click", (e) => {
      if (!this.visible) {
        this.showSpotlight();
        e.stopPropagation();
      }
    });
    // build action list collection
    this.setupFuse();
  }

  get selected(): HTMLElement {
    return this.alSelected;
  }

  set selected(elem: HTMLElement) {
    if (this.alSelected) this.alSelected.classList.remove("selected");
    this.alSelected = elem;
    if (elem == null || elem.classList.contains("hidden")) return;

    this.scrollToElement(elem);

    elem.classList.add("selected");
  }

  scrollToElement(elem: HTMLElement) {
    let y = elem.offsetTop;
    let top = this.actionList.scrollTop;
    let viewport = top + this.actionList.offsetHeight;
    if (y - 56 < top || y > viewport) this.actionList.scrollTop = y - 56;
  }

  startSpotlight(e: KeyboardEvent) {
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
  }

  hideSpotlight() {
    if (this.visible) {
      this.spotlightWrapper.classList.add("hidden");
      this.body.classList.remove("shaded");
      this.visible = false;
      this.labelText[2].classList.add("labelHidden");
      if (this.labelText[1].classList.contains("labelHidden"))
        this.labelText[0].classList.remove("labelHidden");
    }
    this.focusEditor();
  }

  showSpotlight() {
    this.spotlightWrapper.classList.remove("hidden");
    this.body.classList.add("shaded");
    this.spotlight.value = "";
    this.savedRange = this.editor.getCursorPosition();
    this.hideAll();
    window.setTimeout(() => this.spotlight.focus(), 0);
    this.visible = true;
    this.label.classList.remove("postInfo");
    this.label.classList.remove("postError");
    this.labelText[2].classList.remove("labelHidden");
    this.labelText[1].classList.add("labelHidden");
    this.labelText[0].classList.add("labelHidden");
  }

  focusEditor() {
    window.setTimeout(() => this.editor.focus(), 0);
    if (this.savedRange != null) {
      this.editor.moveCursorToPosition(this.savedRange);
    }
  }
  
  hideAll() {
    for (let i = 0; i < this.dataList.length; i++)
      this.dataList[i].classList.add("hidden");
  }

  scrollScripts(e: KeyboardEvent) {
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
  }

  search() {
    let query = this.spotlight.value;
    this.hideAll();
    if (query == "" || query.length > 20) return;

    if (query == "*") {
      this.visibleActions = this.actionCollection.map(this.actionSearchMap);
    } else {
      const searchResult = this.fuse.search(query).filter(e => e.score < 0.4);
      this.visibleActions = searchResult.map(res => res.item).map(this.actionSearchMap);
    }

    if (this.visibleActions.length > 0) {
      this.selected = this.visibleActions[0];
      this.alPlaceholder.classList.add("hidden");
    } else {
      this.selected = null;
      this.alPlaceholder.classList.remove("hidden");
    }
  }

  actionSearchMap(action: Action, i: number) {
    let currentDom = action.dom;
    currentDom.classList.remove("hidden");
    currentDom.style.order = String(i);
    return currentDom;
  }

  setupFuse() {
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
