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
	
	hideSpotlight: () => {
		spotlight.spotlightWrapper.classList.toggle("hidden", !spotlight.visible);
		spotlight.spotlight.value = '';
		spotlight.visible = false;
	},

	showSpotlight: () => {
		spotlight.spotlightWrapper.classList.toggle("hidden", spotlight.visible);
		spotlight.spotlight.focus();
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
			if (e.code === 'Escape') 
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