let $ = Bliss;
let $$ = $.$;

$$("pre.runnable > code").forEach(code => {
	let pre = code.parentNode;
	let text = code.textContent;
	text = text.replace(/let (\w+)/g, "window.$1");
	
	let fun = Function(`return (()=>{${text}})()`);

	$.create("button", {
		textContent: "▶",
		onclick: evt => {
			console.log(fun());
		},
		inside: pre
	});
});
