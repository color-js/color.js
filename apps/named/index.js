import Color from "../../src/index.js";
import KEYWORDS from "../../src/keywords.js";

const L_CUTOFF = .65;

for (let method in Color.prototype) {
	if (method.startsWith("deltaE")) {
		method = method.slice(6);
		let selected = method === "OK"? " selected" : "";
		deltaE_method.insertAdjacentHTML("beforeend", `<option${selected}>${method}</option>`);
	}
}

function render() {
	let color;

	try {
		color = new Color(input_color.value);
		input_color.setCustomValidity("");
	}
	catch (e) {
		input_color.setCustomValidity("Invalid color");
		input_color.reportValidity();
		return;
	}

	let str = color.display();

	input_color.classList.toggle("oog", !str.color.inGamut());

	document.body.style.setProperty("--color", str);
	document.body.classList.toggle("light-color", color.oklch.l > L_CUTOFF);
	document.body.classList.toggle("dark-color", color.oklch.l <= L_CUTOFF);

	closest_colors.textContent = "";

	let results = [];

	for (let keyword in KEYWORDS) {
		let keywordColor = new Color("srgb", KEYWORDS[keyword]);
		let deltaE = keywordColor.deltaE(color, {method: deltaE_method.value});
		results.push({keyword, keywordColor, deltaE});
	}

	results = results.sort((a, b) => a.deltaE - b.deltaE);

	for (let result of results) {
		let keyword = result.keyword;
		let keywordColor = result.keywordColor;
		let deltaE = result.deltaE;

		closest_colors.insertAdjacentHTML("beforeend", `
		<article class="keyword-color ${keywordColor.oklch.l > L_CUTOFF? "light-color" : "dark-color"}" style="--color: ${keywordColor}">
			<code class="keyword">${keyword}</code>
			<code class="delta-e">${deltaE.toFixed(2)}</code>
		</article>
		`);
	}
}

deltaE_method.oninput = input_color.oninput = render;
render();