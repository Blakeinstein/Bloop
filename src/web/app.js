import CodeMirror from 'codemirror';

import './code-mirror/mode';

import 'codemirror/keymap/sublime'

import Fuse from 'fuse.js';

window.editor = CodeMirror(
	document.getElementsByClassName('window-body')[0],{
		scrollbarStyle: null,
		electricChars: false,
		lineWrapping: true,
		autofocus: true,
		lineNumbers: true,
		keyMap: "sublime",
		extraKeys: {
			Tab: (cm) => {
				CodeMirror.commands[cm.somethingSelected()? "indentMore" : "insertTab"](cm);
			}
		},
		mode: "bloop"
	}
);
	
window.titlebar = {
	close: document.getElementsByClassName("titlebar-close")[0],
	minimize: document.getElementsByClassName("titlebar-minimize")[0],
	maximize: document.getElementsByClassName("titlebar-fullscreen")[0],
	maximizeNodes: null,
	titlebar: document.getElementsByClassName("titlebar")[0],
	maximizeState: false,

	maximizeEvent: () => {
		if (titlebar.maximizeState) {
			titlebar.maximizeNodes[0].classList.remove('hidden');
			titlebar.maximizeNodes[1].classList.add('hidden');
			titlebar.maximizeState = false;
		}
		else {
			titlebar.maximizeNodes[1].classList.remove('hidden');
			titlebar.maximizeNodes[0].classList.add('hidden');
			titlebar.maximizeState = true;
		}
		external.invoke('maximize');
	},

	init: () => {
		titlebar.maximizeNodes = titlebar.maximize.children;
		titlebar.close.onclick = (e) => {
			e.stopPropagation();
			external.invoke('exit');
		}
		titlebar.minimize.onclick = (e) => {
			external.invoke('minimize');
			e.stopPropagation();
		}
		titlebar.maximize.onclick = (e) => titlebar.maximizeEvent();
		titlebar.titlebar.addEventListener('mousedown', () => {
			external.invoke('drag_intent');
		});
		titlebar.titlebar.ondblclick = () => titlebar.maximizeEvent();
	}
}

// * Implement Spotlight
window.spotlight = {
	firstChar: false,
    visible: false,
    spotlightWrapper: document.getElementById('spotlight-wrapper'),
	spotlight: document.getElementById('spotlight'),
	body: document.getElementsByClassName('window-body')[0],
	savedRange: null,
	// ** Spotlight actions
	dataList: document.getElementsByClassName('action-list')[0].children,
	alPlaceholder: null,
	actionList: document.getElementsByClassName('action-list')[0],
	label: document.getElementsByClassName('titlebar-spotlight')[0],
	labelText: document.getElementsByClassName('label'),
	alSelected: null,
	actionCollection: [],
	visibleActions: [],
	fuse: null,
	spotlightActions: {
		count: 0,
		addAction: (name, desc, icon, tags) => {
			let listItem = document.createElement("li");
			listItem.innerHTML = `<div><i class="${icon}-icon listIcon"></i><div>
									<Name>${name}</Name>
									<description>${desc}</description>
									</div></div>`;
			listItem.setAttribute("name", name);
			listItem.onclick = () => editorObj.script = name;
			listItem.onmouseover = () => spotlight.selected = listItem;
			spotlight.actionList.appendChild(listItem);
			spotlight.spotlightActions.count++;
			spotlight.fuse.add({
				'name': name,
				'tags': tags.split(','),
				'desc': desc,
				'dom': listItem
			});
			// if
		},
		finalize: () => {
			let listItem = document.createElement("li");
			listItem.innerHTML = "<div>No match found</div>";
			listItem.setAttribute("id", "action-list-placeholder");
			listItem.classList.add("hidden");
			spotlight.actionList.appendChild(listItem);
			spotlight.alPlaceholder = listItem;
		},
		Ok: () => {
			// * Script has finished execution, return.
			spotlight.hideSpotlight();
		}
	},

	get selected() {
		return spotlight.actionCollection.indexOf(spotlight.alSelected);
	},
	
	set selected(elem) {
		if (spotlight.alSelected)
			spotlight.alSelected.classList.remove('selected');
		spotlight.alSelected = elem;
		if (elem == null)
			return;
		if (!elem.classList.contains('hiddens')) {
			let y = elem.offsetTop;
			let top = spotlight.actionList.scrollTop;
			let viewport = top + spotlight.actionList.offsetHeight;
			if ((y - 56) < top || y > viewport)
				spotlight.actionList.scrollTop = y-56;
		}
		elem.classList.add('selected');
	},
	
	hideSpotlight: () => {
		spotlight.spotlightWrapper.classList.add("hidden");
		spotlight.body.classList.remove("shaded");
		window.setTimeout(() => window.editorObj.focus(), 0);
		if (spotlight.savedRange != null) {
			editor.setCursor(spotlight.savedRange);
		}
		spotlight.visible = false;
		spotlight.labelText[2].classList.add("labelHidden");
		if (spotlight.labelText[1].classList.contains("labelHidden"))
			spotlight.labelText[0].classList.remove("labelHidden");
	},

	showSpotlight: () => {
		spotlight.spotlightWrapper.classList.remove("hidden");
		spotlight.body.classList.add("shaded");
		spotlight.spotlight.value = '';
		spotlight.savedRange = editor.getCursor();
		for (let i = 0; i < spotlight.dataList.length; i++)
			spotlight.dataList[i].classList.add('hidden');
		window.setTimeout(() => spotlight.spotlight.focus(), 0);
		spotlight.visible = true;
		spotlight.labelText[2].classList.remove("labelHidden");
		spotlight.labelText[1].classList.add("labelHidden");
		spotlight.labelText[0].classList.add("labelHidden");
	},

	search: () => {
		let query = spotlight.spotlight.value;

		spotlight.visibleActions = [];
		for (let i = 0; i < spotlight.dataList.length; i++)
			spotlight.dataList[i].classList.add('hidden');

		if (query == "" || query.length > 20){
			return;
		};

		if (query == "*") {
			for (let i in spotlight.actionCollection) {
				let currentDom = spotlight.actionCollection[i].dom;
				currentDom.classList.remove('hidden');
				currentDom.style.order = i;
				spotlight.visibleActions.push(currentDom);
			}
		};

		const searchResult = spotlight.fuse.search(query).filter(
			(e) => e.score<0.4
		);

		for (let i in searchResult) {
			let currentDom = searchResult[i].item.dom;
			currentDom.classList.remove('hidden');
			currentDom.style.order = i;
			spotlight.visibleActions.push(currentDom);
		};

		if (spotlight.visibleActions.length > 0) {
			spotlight.selected = spotlight.visibleActions[0];
			spotlight.alPlaceholder.classList.add('hidden');
		}
		else {
			spotlight.selected = null;
			spotlight.alPlaceholder.classList.remove('hidden');
		}
	},

	init: () => {
		// Create event listeners
		document.addEventListener('keydown', (e) => {
			if (e.ctrlKey){
				if (e.key === 'b') {
					e.preventDefault();
					if (e.shiftKey && editorObj.script)
						editorObj.script = editorObj.script;
					else{
						if (!spotlight.visible)
							spotlight.showSpotlight();
						else
							spotlight.hideSpotlight();
					}
				}
				else if (e.key === 'n') {
					editorObj.fullText = "";
					spotlight.labelText[2].classList.add("labelHidden");
					spotlight.labelText[1].classList.add("labelHidden");
					spotlight.labelText[0].classList.remove("labelHidden");
				}
				else if (e.key === 'q') {
					external.invoke('exit');
				}
			}
		}, true);
		window.addEventListener('keypress', (e) => {
			if (!spotlight.visible && !editor.hasFocus()){
				window.setTimeout(() => window.editorObj.focus(), 0);
				if (spotlight.savedRange != null) {
					editor.setCursor(spotlight.savedRange);
				}
			}
		});
		document.addEventListener('click', (event) => {
			if (!editorObj.somethingSelected())
				event.preventDefault();
			if (spotlight.visible)
				spotlight.hideSpotlight();
			else if(!editor.hasFocus()){
				window.setTimeout(() => window.editorObj.focus(), 0);
				if (spotlight.savedRange != null) {
					editor.setCursor(spotlight.savedRange);
				}
			}	
		}, false);
		editor.on("blur", (cm) => {
			spotlight.savedRange = editor.getCursor();
		});
		
		spotlight.spotlight.addEventListener('keyup', (e) => {
			if (e.which == 13) {
				e.preventDefault();
				e.stopPropagation();
				editorObj.script = spotlight.alSelected.getAttribute('name');
			}
			else if (e.key === 'Escape') 
				spotlight.hideSpotlight();
		});
		spotlight.spotlight.addEventListener('keydown', (e) => {
			if (!spotlight.visibleActions) return;
			let i = Array.prototype.indexOf.call(spotlight.visibleActions, spotlight.alSelected);

			if (e.key === 'ArrowDown') {
				e.preventDefault();
				if (i < spotlight.visibleActions.length - 1) {
					spotlight.selected = spotlight.visibleActions[i+1];
				}
			}
			else if (e.key === 'ArrowUp') {
				e.preventDefault();
				if (i > 0) {
					spotlight.selected = spotlight.visibleActions[i-1];
				}
			}
		})
		spotlight.spotlight.addEventListener('input', spotlight.search);
		spotlight.spotlight.addEventListener('click', (e) => {
			e.stopPropagation();
		});
		spotlight.label.addEventListener('click', (e) => {
			if (!spotlight.visible){
				spotlight.showSpotlight();
				e.stopPropagation();
			}
		});
		// build action list collection
		spotlight.fuse = new Fuse(spotlight.actionCollection, {
			includeScore: true,
			keys: [
				{
					name: 'name',
					weight: 0.9,
				},
				{
					name: 'tags',
					weight: 0.6,
				},
				{
					name: 'desc',
					weight: 0.2,
				}
			]
		})
	}
};

window.editorObj = {
	_script: "",
	get script() {
		return editorObj._script;
	},
	get isSelection() {
		return window.editor.somethingSelected();
	},
	get fullText() {
		return window.editor.getValue();
	},
	get text() {
		return window.editorObj.isSelection? 
			window.editorObj.selection : window.editorObj.fullText;
	},
	get selection() {
		return window.editor.getSelection();
	},

	set script(value) {
		editorObj._script = value;
		external.invoke("#"+value);
	},
	set selection(value) {
		window.editor.replaceSelection(value);
	},
	set fullText(value) {
		window.editor.setValue(value);
	},
	set text(value) {
		console.log(window.editorObj.isSelection)
		if (window.editorObj.isSelection)
			window.editorObj.selection = value
		else
			window.editorObj.fullText = value
	},
	focus: () => {
		window.editor.focus();
		window.editor.setCursor(window.editor.lineCount(), 0);
	},
	postInfo: (message) => {
		spotlight.labelText[1].innerText = message;
		spotlight.labelText[1].classList.remove('labelHidden', 'postError');
		spotlight.labelText[1].classList.add('postInfo');
	},
	postError: (message) => {
		spotlight.labelText[1].innerText = message;
		spotlight.labelText[1].classList.remove('labelHidden', 'postInfo');
		spotlight.labelText[1].classList.add('postError');
	},
};

//* Execute
window.spotlight.init();

window.titlebar.init();

window.addEventListener("dragover", (e) => {
	e.preventDefault();
});
window.addEventListener("drop", (e) => {
	e.preventDefault();
	
	for (let i in e.dataTransfer.files) {
		let reader = new FileReader();
		reader.onload = (ev) => {
			editor.replaceSelection(ev.target.result, "end");
		}
		reader.readAsText(e.dataTransfer.files[i]);
	}
})

window.onload = () => {
	external.invoke('doc_ready');
	window.editorObj.focus();
}

/// #if env == 'DEBUG'
const external = {
	invoke: (script) => {
		let fn = window[script.slice(1)]
		if (typeof fn === "function") fn(window.editorObj);
	}
};

window.Test = (text) => {
	text.text = "did it work?";
	text.postInfo = "Hello World!";
};

spotlight.spotlightActions.addAction(
	"Test",
	"Testing script",
	"quote",
	"test,test,one,two"
);

spotlight.spotlightActions.finalize();
/// #endif