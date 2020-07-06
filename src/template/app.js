// * Implement line numbers
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
			else if (e.code === 'Escape') 
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

// * Spotlight
const spotlight = {
	firstChar: false,
    visible: false,
    pissed: false,
    spotlightWrapper: document.getElementById('spotlight-wrapper'),
	spotlight: document.getElementById('spotlight'),
	body: document.getElementsByClassName('window-body')[0],
	savedRange: null,
	
	hideSpotlight: () => {
		spotlight.spotlightWrapper.classList.toggle("hidden", !spotlight.visible);
		spotlight.body.classList.toggle("shaded", spotlight.visible);
		spotlight.spotlight.value = '';
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
		spotlight.spotlightWrapper.classList.toggle("hidden", spotlight.visible);
		spotlight.body.classList.toggle("shaded", !spotlight.visible);
		if (window.getSelection)
			//non IE Browsers
			spotlight.savedRange = window.getSelection().getRangeAt(0);
		else if (document.selection)
		//IE 
			spotlight.savedRange = document.selection.createRange();
		window.setTimeout(() => editor.blur(), 0);
		window.setTimeout(() => spotlight.spotlight.focus(), 0);
		spotlight.visible = false;
	},
	
	init: () => {
		// 17 -> ctrl / cmd
		// 32 -> "⎵"
		// 13 -> enter
		document.addEventListener('keydown', (e) => {
			if (e.ctrlKey && e.key === 'b') {
				e.preventDefault();
				if (!spotlight.visible)
					spotlight.showSpotlight();
				else
					spotlight.hideSpotlight();
			}
			if (e.key === 'Escape') 
				spotlight.hideSpotlight();
		});
		spotlight.spotlight.addEventListener('keyup', (e) => {
			if (e.which == 13) {
				console.log("Implement spotlight functionality");
			}
		});
		spotlight.spotlight.addEventListener('click', (e) => {
			e.stopPropagation();
		});
		document.addEventListener('click', function () {
			spotlight.hideSpotlight();
		});
	}
};

// * Declare Observer properties
/* const	callback = (mutationList,	observer)	=> {
	let	mutation =	mutationList[mutationList.length - 1];
	if	(mutation.type === "childList")	{
		lineEnum.update(mutation.target);
	}
};

const	observer = new MutationObserver(callback);
const	config = { childList:	true };

observer.observe(editor, config); */

// * Execute
const	editor = document.getElementsByClassName("code-input")[0];

lineEnum.init(editor);

spotlight.init();

editor.focus();

// add logic for movable window
document.getElementsByClassName("titlebar")[0].addEventListener('mousedown', () => {
	external.invoke('drag_intent');
});