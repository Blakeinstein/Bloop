// * Implement line numbers
const lineEnum = {
	eventList: [],
	state:  false,
	count: 	0,
	gutter:	document.getElementsByClassName("line-numbers")[0],
	update: (box) => {
		let count = box.childElementCount || (box.innerText.split("\n").length - 1);
		console.log(count)
		let	delta =	count - lineEnum.count;

		console.log(box, box.childElementCount)

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

// add logic for movable window
document.getElementsByClassName("titlebar")[0].addEventListener('mousedown', () => {
	external.invoke('drag_intent');
});