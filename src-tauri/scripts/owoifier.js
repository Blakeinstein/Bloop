/**
	{
		"api":1,
		"name":"OWOifier",
		"description":"OWOify!",
		"author":"Blaine",
		"icon":"color-wheel",
    "tags":"meme,text,joke,fun",
    "bias":0.0
	}
**/
const faces=["(・`ω´・)",";;w;;","owo","UwU",">w<","^w^"];

function owoify(text) 
{

	let v = text;

	v = v.replace(/(?:r|l)/g, "w");
	v = v.replace(/(?:R|L)/g, "W");
	v = v.replace(/n([aeiou])/g, 'ny$1');
	v = v.replace(/N([aeiou])/g, 'Ny$1');
	v = v.replace(/N([AEIOU])/g, 'Ny$1');
	v = v.replace(/ove/g, "uv");

	
	let exclamationPointCount = 0;
	let i;
	let stringsearch = "!";
	//for loop counts the # of individual exclamation points
	for(let i=0; i < v.length; i++) {
		stringsearch===v[exclamationPointCount++]
	};
	for (i = 0; i < exclamationPointCount; i++) {
			v = v.replace("!", " "+ faces[Math.floor(Math.random()*faces.length)]+ " ");
	}
	return (v);
}

function main(state) {
	try {
        state.text = owoify(state.text);
	}
	catch(error) {
		state.postError("Explain what went wrong here...")
	}
	
}