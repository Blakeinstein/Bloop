const titlebar = {
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
			external.invoke('maximize');
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
const spotlight = {
	firstChar: false,
    visible: false,
    pissed: false,
    spotlightWrapper: document.getElementById('spotlight-wrapper'),
	spotlight: document.getElementById('spotlight'),
	body: document.getElementsByClassName('window-body')[0],
	savedRange: null,
	dataList: document.getElementsByClassName('action-list')[0].children,
	alPlaceholder: document.getElementById('action-list-placeholder'),
	label: document.getElementsByClassName('titlebar-spotlight')[0],
	labelText: document.getElementsByClassName('label'),
	alSelected: 0,

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
			if (window.getSelection){
				//non IE and there is already a selection
				var s = window.getSelection();
				if (s.rangeCount > 0) 
				s.removeAllRanges();
				s.addRange(spotlight.savedRange);
			}
			else if (document.createRange){
				//non IE and no selection
				window.getSelection().addRange(spotlight.savedRange);
			}
			else if (document.selection){
				//IE
				spotlight.savedRange.select();
			}
		}
		spotlight.visible = false;
		spotlight.labelText[1].classList.add("labelHidden");
		spotlight.labelText[0].classList.remove("labelHidden");
	},

	showSpotlight: () => {
		spotlight.spotlightWrapper.classList.remove("hidden");
		spotlight.body.classList.add("shaded");
		spotlight.spotlight.value = '';
		if (window.getSelection)
			//non IE Browsers
			spotlight.savedRange = window.getSelection().getRangeAt(0);
		else if (document.selection)
		//IE 
			spotlight.savedRange = document.selection.createRange();
		for (let i = 0; i < spotlight.dataList.length; i++)
			spotlight.dataList[i].classList.add('hidden');
		window.setTimeout(() => editor.blur(), 0);
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
				editorObj.script = "Base64Decode.js";
				external.invoke("sc"+editorObj.script);
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
		});
		spotlight.label.addEventListener('click', (e) => {
			if (!spotlight.visible){
				spotlight.showSpotlight();
				e.stopPropagation();
			}
		});
	}
};

const	editor = document.getElementsByClassName("code-input")[0];

const editorObj = {
	// isSelection: false,
	// fullText: editor.innerText,
	// text: editor.innerText,
	// script: 'base64decode',
	// postError: (message) => alert(message),
	// postInfo: (message) => alert(message)
	script: "",
	get isSelection() {
		return false;
	},
	get fullText() {
		return editor.innerText;
	},
	get text() {
		return editorObj.isSelection? editorObj.selection : editorObj.fullText;
	},
	get selection() {
		return editorObj.fullText;
	},
	set fullText(value) {
		console.log(value);
		editor.innerHTML = "<div><br></div>";
		textList = value.split("\n");
		text = "";
		for (let i in textList)
			text += "<div>"+textList[i].replace(/\s/g, '&nbsp;')+"</div>";
		// insert text manually
		editor.innerHTML = text;
	},
	set text(value) {
		if (editorObj.isSelection)
			editorObj.selection = value
		else
			editorObj.fullText = value
	},
	postInfo: (message) => console.log(message),
};

// * Execute
document.execCommand("defaultParagraphSeparator", false, "div")

editor.addEventListener("paste", function(e) {
    // cancel paste
    e.preventDefault();

    // get text representation of clipboard
	var text = (e.originalEvent || e).clipboardData.getData('text/plain');
	textList = text.split("\n");
	text = "";
	for (let i in textList)
		text += "<div>"+textList[i].replace(/\s/g, '&nbsp;')+"</div>";
    // insert text manually
    document.execCommand("insertHTML", false, text);
});

// * Dont remove line 1.
editor.addEventListener("keydown", (e) => {
	if (e.key == "Backspace" && e.target.innerText.trim() == "")
		e.preventDefault();
});

spotlight.init();

titlebar.init();

window.onload = () => editor.focus();