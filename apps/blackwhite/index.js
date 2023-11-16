import Color from "../../color.js";
import * as contrastAlgorithms from "../../src/contrast/index.js";

for (let algo in contrastAlgorithms) {
	let algoName = algo.replace(/^contrast/, "");

	contrast_algorithm.insertAdjacentHTML(
		"beforeend",
		`<option>${algoName}</option>`,
	);
}

const root = document.documentElement;
let previousAlgo;

function computeTextColor() {
	let algo = contrast_algorithm.value;

	previous_algo.textContent = previousAlgo;
	current_algo.textContent = algo;

	for (let div of colors.children) {
		let color = div.color;
		let onWhite = Math.abs(color.contrast("white", algo));
		let onBlack = Math.abs(color.contrast("black", algo));
		let textColor = onWhite > onBlack ? "white" : "black";
		let changed = div.style.color && textColor !== div.style.color;
		div.style.color = textColor;
		div.classList.toggle("changed", changed);
	}

	previousAlgo = algo;
}

function drawColors() {
	colors.innerHTML = "";
	let granularity = Math.cbrt(number_of_colors.value);
	// root.style.setProperty("--granularity", granularity);
	let increment = 1 / granularity;

	for (let r = 0; r <= 1; r += increment) {
		for (let g = 0; g <= 1; g += increment) {
			for (let b = 0; b <= 1; b += increment) {
				let color = new Color("srgb", [r, g, b]);
				let [l, c, h] = color.getAll("oklch");
				l = Math.round(l * 100);
				c = Math.round(c * 100);
				h = Math.round(h);

				let div = document.createElement("div");
				div.textContent = "Text";
				div.setAttribute(
					"style",
					`background-color: ${color.display()}; --l: ${l}; --c: ${c}; --h: ${h}`,
				);
				div.color = color;
				colors.append(div);
			}
		}
	}

	computeTextColor();
}

function render(evt) {
	if (!evt || evt.target === number_of_colors) {
		number_of_colors.title = number_of_colors.value;
		drawColors();
	}

	if (!evt || evt.target === contrast_algorithm) {
		computeTextColor();
	}

	if (!evt || evt.target === show_changes) {
		root.classList.toggle("show-changes", show_changes.checked);
	}

	if (!evt || evt.target === order_by) {
		root.dataset.order = order_by.value;
	}
}

document.body.addEventListener("input", render);

render();
