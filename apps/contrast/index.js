import Color from "../../color.js";
import * as contrastAlgorithms from "../../src/contrast/index.js";

for (let algo in contrastAlgorithms) {
	let algoName = algo.replace(/^contrast/, "");

	contrast_algorithm.insertAdjacentHTML("beforeend", `<option>${algoName}</option>`);
}

function computeTextColor() {
	let algo = contrast_algorithm.value;

	for (let div of colors.children) {
		let color = div.color;
		let onWhite = Math.abs(color.contrast("white", algo));
		let onBlack = Math.abs(color.contrast("black", algo));
		let textColor = onWhite > onBlack? "white" : "black";
		let changed = div.style.color && textColor !== div.style.color;
		div.style.color = textColor;
		div.classList.toggle("changed", changed);
	}
}

function drawColors() {
	let granularity = Math.cbrt(number_of_colors.value);
	document.documentElement.style.setProperty("--granularity", granularity);
	let increment = 1 / granularity;

	for (let r=0; r<=1; r += increment) {
		for (let g=0; g<=1; g += increment) {
			for (let b=0; b<=1; b += increment) {
				let color = new Color("srgb", [r, g, b]);
				let div = document.createElement("div");
				div.textContent = "Text";
				div.style.backgroundColor = color.display();
				div.color = color;
				colors.append(div);
			}
		}
	}

	computeTextColor();
}

contrast_algorithm.addEventListener("input", evt => {
	computeTextColor();
});

number_of_colors.addEventListener("input", evt => {
	number_of_colors.title = number_of_colors.value;

	drawColors();
})

show_changes.addEventListener("input", evt => {
	changed_style.media = show_changes.checked? "all" : "not all";
})

drawColors();