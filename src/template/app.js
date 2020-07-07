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
		titlebar.close.onclick = () => {
			external.invoke('exit');
		}
		titlebar.minimize.onclick = () => {
			external.invoke('maximize');
		}
		titlebar.maximize.onclick = () => titlebar.maximizeEvent();
		titlebar.titlebar.addEventListener('mousedown', () => {
			external.invoke('drag_intent');
		});
		titlebar.titlebar.ondblclick = () => titlebar.maximizeEvent();
	}
}


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
		spotlight.spotlightWrapper.classList.toggle("hidden");
		spotlight.body.classList.toggle("shaded");
		spotlight.visible = false;
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
	},

	showSpotlight: () => {
		spotlight.spotlightWrapper.classList.toggle("hidden");
		spotlight.body.classList.toggle("shaded");
		spotlight.spotlight.value = '';
		if (window.getSelection)
			//non IE Browsers
			spotlight.savedRange = window.getSelection().getRangeAt(0);
		else if (document.selection)
		//IE 
			spotlight.savedRange = document.selection.createRange();
		window.setTimeout(() => editor.blur(), 0);
		window.setTimeout(() => spotlight.spotlight.focus(), 0);
		spotlight.visible = true;
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
				console.log("Implement spotlight functionality");
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
			if (flag == spotlight.dataList.length - 1 && flag != 0) {
				spotlight.selected = 0;
			}
		})
		spotlight.spotlight.addEventListener('click', (e) => {
			e.stopPropagation();
		});
		document.addEventListener('click', function () {
			if (spotlight.visible)
				spotlight.hideSpotlight();
		});
	}
};
	
// * Execute
const	editor = document.getElementsByClassName("code-input")[0];

document.execCommand("defaultParagraphSeparator", false, "div")

editor.addEventListener("paste", function(e) {
    // cancel paste
    e.preventDefault();

    // get text representation of clipboard
    var text = (e.originalEvent || e).clipboardData.getData('text/plain');

    // insert text manually
    document.execCommand("insertHTML", false, text);
});

// * Dont remove line 1.
editor.addEventListener("keydown", (e) => {
	console.log(e.target.innerText);
	if (e.key == "Backspace" && (e.target.innerText == "\n" || e.target.innerText == "")) {
		console.log("yo ", e.target.innerText);
		e.preventDefault();
	}
});

spotlight.init();

titlebar.init();

window.onload = () => editor.focus();