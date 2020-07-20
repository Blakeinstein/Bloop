import CodeMirror from 'codemirror';
import Fuse from 'fuse.js';

window.editor = CodeMirror(
	document.getElementsByClassName('window-body')[0],
	{
		scrollbarStyle: null,
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
	// ** Spotlight actions
	dataList: document.getElementsByClassName('action-list')[0].children,
	alPlaceholder: null,
	actionList: document.getElementsByClassName('action-list')[0],
	label: document.getElementsByClassName('titlebar-spotlight')[0],
	labelText: document.getElementsByClassName('label'),
	alSelected: null,
	actionCollection: [],
	fuse: null,
	spotlightActions: {
		count: 0,
		addAction: (name, desc, icon, tags) => {
			let listItem = document.createElement("li");
			listItem.innerHTML = `<div><i class="${icon}-icon listIcon"></i><div>
									<Name>${name}</Name>
									<description>${desc}</description>
									</div></div>`;
			// listItem.setAttribute("tags", tags);
			// listItem.setAttribute("name", name);
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

	search: () => {
		let query = spotlight.spotlight.value;

		if (query == "" || query.length > 20){
			for (let i = 0; i < spotlight.dataList.length; i++)
				spotlight.dataList[i].classList.add('hidden');
			return;
		};

		const searchResult = spotlight.fuse.search(query);

		let flag = 0, flag2 = true;
		for (let i in searchResult) {
			let action = searchResult[i];

			if (action.score < 0.4) {
				action.item.dom.classList.remove('hidden');
				if (flag2^=1)
					spotlight.selected = action.item.dom;
			} else {
				action.item.dom.classList.add('hidden');
				flag++;
			}
		}

		if (flag >= searchResult.length) {
			spotlight.selected = null;
			spotlight.alPlaceholder.classList.remove('hidden');
		}
		else 
			spotlight.alPlaceholder.classList.add('hidden');

	},

	init: () => {
		// Create event listeners
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
				if (spotlight.selected != spotlight.actionCollection.length - 1) {
					var i = spotlight.selected;
					while (++i < spotlight.actionCollection.length && spotlight.actionCollection[i].dom.classList.contains('hidden'));
					spotlight.selected = spotlight.actionCollection[i].dom;
				}
			}
			else if (e.key === 'ArrowUp') {
				e.preventDefault();
				if (spotlight.selected > 0) {
					var i = spotlight.selected;
					while (--i >= 0 && spotlight.actionCollection[i].dom.classList.contains('hidden'));
					spotlight.selected = spotlight.actionCollection[i].dom;
				}
			}
		})
		spotlight.spotlight.addEventListener('input', spotlight.search)
		spotlight.spotlight.addEventListener('click', (e) => {
			e.stopPropagation();
		});
		document.addEventListener('click', () => {
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
		// build action list collection
		spotlight.fuse = new Fuse(spotlight.actionCollection, {
			includeScore: true,
			findAllMatches: true,
			threshold: 1,
			shouldSort: false,
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