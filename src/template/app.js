// * Implement line numbers
const lineEnum = {
	eventList: [],
	state:  false,
	count: 	0,
	gutter:	document.getElementsByClassName("line-numbers")[0],
	update: (box) => {
		let count = box.innerText.split("\n").length - 1;
		console.log(count)
		let	delta =	count - lineEnum.count;

		if (box.children.length	== 0) delta++;
		if (delta === 0) return;
		console.log("Update called with ", delta);
		if (delta > 0 && lineEnum.state)	{
			const frag = document.createDocumentFragment();
			while (delta > 0) {
				const line_number =	document.createElement("span");
				line_number.className =	"line-num";
				frag.appendChild(line_number);
				lineEnum.count++;
				delta--;
			}
			
			lineEnum.gutter.appendChild(frag);
		}	else {
			if (lineEnum.count + delta === 0) delta++;
			while (delta < 0 && lineEnum.gutter.lastChild) {
				lineEnum.gutter.removeChild(lineEnum.gutter.lastChild);
				lineEnum.count--;
				delta++;
			}
		}
	},
	init:	(box) => {
		if (lineEnum.state)	return;
		lineEnum.state = true;
		lineEnum.update(box);
		
		// * better to use event listeners on div
		const __change_evts = [
			"change", "input", "keydown", "keyup"
		];
		// Default handler for input events
		const __change_hdlr = function(box) {
			return function(e) {
				if((+box.scrollLeft==10 && (e.keyCode==37||e.which==37
					||e.code=="ArrowLeft"||e.key=="ArrowLeft"))
					|| e.keyCode==36||e.which==36||e.code=="Home"||e.key=="Home"
					|| e.keyCode==13||e.which==13||e.code=="Enter"||e.key=="Enter"
					|| e.code=="NumpadEnter")
					box.scrollLeft = 0;
				lineEnum.update(box);
			}
		}(box);	
		for(let i = __change_evts.length - 1; i >= 0; i--) {
				// box.addEventListener(__change_evts[i], __change_hdlr);
				box.addEventListener(__change_evts[i], __change_hdlr);
				lineEnum.eventList.push({
					evt: __change_evts[i],
					hdlr: __change_hdlr
				});
			}
	},
	remove:	(box) => {
		if (!lineEnum.state ||!lineEnum.gutter.firstChild) return;
		lineEnum.gutter.innerHtml =	"";
		lineEnum.state = false;
	},
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