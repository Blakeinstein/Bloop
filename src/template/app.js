// * Implement line numbers
const lineEnum = {
	state:  false,
	count: 	0,
	gutter:	document.getElementsByClassName("line-numbers")[0],
	update: (box) => {
		box = box;
		let	delta =	box.children.length	- lineEnum.count;
		if (box.children.length	== 0) delta++;
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
		lineEnum.update(box || lineEnum.box);

		// * better to use event listeners on div
		const __change_evts = [
			"propertychange", "input", "keydown", "keyup"
		];
		
		const __change_hdlr = function(editor) {
			console.log(editor);
			return (e) => lineEnum.update(editor);
		}(editor);
	
		for(let i = __change_evts.length - 1; i >= 0; i--) {
			editor.addEventListener(__change_evts[i], __change_hdlr);
		};
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