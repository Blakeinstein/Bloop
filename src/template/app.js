const	lineEnum	=	{
	state: false,
	count: 	0,
	gutter:	document.getElementsByClassName("line-numbers")[0],
	update:	(box)	=> {
		let	delta	=	box.children.length	-	lineEnum.count;
		if (box.children.length	==	0) 	delta++;
		
		console.log({
			delta:	delta,
			count:	lineEnum.count,
			length:	box.children.length,
		});
		if (delta	>	0	&&	lineEnum.state)	{
			const	frag = document.createDocumentFragment();
			while	(delta 	>	0) {
				const	line_number	=	document.createElement("span");
				line_number.className	=	"line-num";
				frag.appendChild(line_number);
				lineEnum.count++;
				delta--;
			}
			
			lineEnum.gutter.appendChild(frag);
		}	else {
			if (lineEnum.count	+	delta	===	0) delta++;
			while	(delta < 0 && lineEnum.gutter.lastChild) {
				lineEnum.gutter.removeChild(lineEnum.gutter.lastChild);
				lineEnum.count--;
				delta++;
			}
		}
	},
	init:	(box)	=> {
		if (lineEnum.state)	return;
		lineEnum.state = true;
		lineEnum.update(box);
	},
	remove:	(box)	=> {
		if 	(!lineEnum.state ||	!lineEnum.gutter.firstChild) return;
		lineEnum.gutter.innerHtml	=	"";
		lineEnum.state	=	false;
	},
};

const	callback = (mutationList,	observer)	=> {
	let	mutation =	mutationList[mutationList.length - 1];
	if	(mutation.type === "childList")	{
		console.log(mutation);
		lineEnum.update(mutation.target);
	}
};

const	observer = new MutationObserver(callback);
const	config = { childList:	true };

const	editor = document.getElementsByClassName("code-input")[0];
observer.observe(editor, config);

lineEnum.init(editor);
