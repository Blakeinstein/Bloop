import CodeMirror from 'codemirror';
import Fuse from 'fuse.js';

window.editor = CodeMirror(
	document.getElementsByClassName('window-body')[0],
	{
		scrollbarStyle: null,
		// autofocus: true,
		theme: 'night',
		lineWrapping: true,
		mode: "text/javascript"
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
			external.invoke('exit');
			e.stopPropagation();
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
    pissed: false,
    spotlightWrapper: document.getElementById('spotlight-wrapper'),
	spotlight: document.getElementById('spotlight'),
	body: document.getElementsByClassName('window-body')[0],
	savedRange: null,
	dataList: document.getElementsByClassName('action-list')[0].children,
	alPlaceholder: document.getElementById('action-list-placeholder'),
	actionList: document.getElementsByClassName('action-list')[0],
	label: document.getElementsByClassName('titlebar-spotlight')[0],
	labelText: document.getElementsByClassName('label'),
	alSelected: 0,
	spotlightActions: {
		count: 0,
		addAction: (name, desc, icon, tags) => {
			let listItem = document.createElement("li");
			listItem.innerHTML = `<div class=${icon}><div>
									<Name>${name}</Name>
									<description>${desc}</description>
								</div></div>`;
			listItem.setAttribute("tags", tags);
			listItem.setAttribute("name", name);
			spotlight.actionList.appendChild(listItem);
			spotlight.spotlightActions.count++;
			// if
		},
		finalize: () => {
			let listItem = document.createElement("li");
			listItem.innerHTML = "<div>No match found</div>";
			listItem.setAttribute("id", "action-list-placeholder");
			listItem.classList.add("hidden");
			spotlight.actionList.appendChild(listItem);
		}
	},

	get selected() {
		return spotlight.alSelected;
	},
	
	set selected(value) {
		spotlight.dataList[spotlight.alSelected].classList.remove('selected');
		spotlight.alSelected = value > 0 && value < spotlight.dataList.length - 1 ? value : 0;
		spotlight.dataList[spotlight.alSelected].classList.add('selected');
	},
	
	hideSpotlight: () => {
		spotlight.spotlightWrapper.classList.add("hidden");
		spotlight.body.classList.remove("shaded");
		window.setTimeout(() => editor.focus(), 0);
		if (spotlight.savedRange != null) {
			editor.setCursor(spotlight.savedRange);
		}
		spotlight.visible = false;
		spotlight.labelText[1].classList.add("labelHidden");
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
		spotlight.labelText[1].classList.remove("labelHidden");
		spotlight.labelText[0].classList.add("labelHidden");
	},

	init: () => {
		document.addEventListener('keydown', (e) => {
			if (e.ctrlKey && e.key === 'b') {
				e.preventDefault();
				if (!spotlight.visible)
					spotlight.showSpotlight();
				else
					spotlight.hideSpotlight();
			}
		});
		spotlight.spotlight.addEventListener('keyup', (e) => {
			if (e.which == 13) {
				editorObj.script = spotlight.dataList[spotlight.alSelected].getAttribute('name');
				external.invoke("#"+editorObj.script);
				spotlight.hideSpotlight();
			}
			else if (e.key === 'Escape') 
					spotlight.hideSpotlight();
		});
		spotlight.spotlight.addEventListener('keydown', (e) => {
			if (e.key === 'ArrowDown') {
				e.preventDefault();
				if (spotlight.alSelected != spotlight.dataList.length - 2) {
					var i = spotlight.selected;
					while (++i < spotlight.dataList.length - 1 && spotlight.dataList[i].classList.contains('hidden'));
					spotlight.selected = i;
				}
			}
			else if (e.key === 'ArrowUp') {
				e.preventDefault();
				if (spotlight.alSelected > 0) {
					var i = spotlight.selected;
					while (--i >= 0 && spotlight.dataList[i].classList.contains('hidden'));
					spotlight.selected = i;
				}
			}
		})
		spotlight.spotlight.addEventListener('input', () => {
			var filter = spotlight.spotlight.value.toUpperCase();
			if (filter == ""){
				for (let i = 0; i < spotlight.dataList.length; i++)
					spotlight.dataList[i].classList.add('hidden');
				return;
			}
			var flag = 0;
			for (var i = 0, flag2=true, name; i < spotlight.dataList.length - 1; i++) {
				name = spotlight.dataList[i].innerText.toUpperCase();
				if (name.toUpperCase().indexOf(filter) >= 0) {
					spotlight.dataList[i].classList.remove('hidden');
					if (flag2 && flag2--)
						spotlight.selected = i;			
				}
				else {
					spotlight.dataList[i].classList.add('hidden');
					flag ++;
				}
			}
			if (flag >= spotlight.dataList.length - 1) {
				spotlight.selected = 0;
				spotlight.dataList[flag].classList.remove('hidden');
			}
			else 
				spotlight.dataList[spotlight.dataList.length - 1].classList.add('hidden');
		})
		spotlight.spotlight.addEventListener('click', (e) => {
			e.stopPropagation();
		});
		document.addEventListener('click', function () {
			if (spotlight.visible)
				spotlight.hideSpotlight();
			else 
				editor.focus();
		});
		spotlight.label.addEventListener('click', (e) => {
			if (!spotlight.visible){
				spotlight.showSpotlight();
				e.stopPropagation();
			}
		});
	}
};

window.editorObj = {
	script: "",
	get isSelection() {
		return editor.somethingSelected();
	},
	get fullText() {
		return editor.getValue();
	},
	get text() {
		return editorObj.isSelection? editorObj.selection : editorObj.fullText;
	},
	get selection() {
		return editor.getSelection();
	},
	set selection(value) {
		editor.replaceSelection(value);
	},
	set fullText(value) {
		editor.setValue(value);
	},
	set text(value) {
		if (editorObj.isSelection)
			editorObj.selection = value
		else
			editorObj.fullText = value
	},
	postInfo: (message) => console.log(message),
};

//* Execute
window.spotlight.init();

window.titlebar.init();

window.onload = () => {
	external.invoke("doc_ready");
	window.editor.focus();
}