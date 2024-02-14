import Color from "../../dist/color.js";

globalThis.Color = Color;

const favicon = document.querySelector('link[rel="shortcut icon"]');
const lch = ["L", "C", "H"];

css_color_input.addEventListener("input", evt => {
	if (css_color.color === null) {
		// Probably typing
		return;
	}

	colorUpdated()

	let inputColor = css_color.color;
	let p3color = inputColor.to("p3");
	let p3Linear = inputColor.to("p3-linear");

	to_p3.color = p3color;
	to_p3linear.color = p3Linear;

	let deltasMap = new Map();
	let minDeltas = [{value: Infinity}, {value: Infinity}, {value: Infinity}];

	for (let cssColor of gamut_mapped.querySelectorAll("css-color")) {
		let method = cssColor.dataset.method;
		let color = p3color.clone();

		let dd = cssColor.closest("dd");
		let stats = dd.querySelector(".deltas");

		if (!stats) {
			dd.insertAdjacentHTML("beforeend", `<dl class="deltas"></dl>`);
			stats = dd.querySelector(".deltas");
		}

		if (color.inGamut("p3")) {
			cssColor.color = color;
			stats.innerHTML = "";
			continue;
		}

		let mappedColor;

		if (method === "scale") {
			let deltas = p3Linear.coords.map(c => c - .5);
			let distances = deltas.map(c => Math.abs(c));
			let max = Math.max(...distances);
			let factor = max / .5;

			let mapped = deltas.map((delta, i) => {
				let scaled = delta / factor;
				return scaled + .5
			});

			mappedColor = new Color("p3-linear", mapped).to("p3");
		}
		else {
			mappedColor = color.toGamut({ method });
		}

		cssColor.color = mappedColor;

		// Show deltas
		let mappedColorLCH = mappedColor.to("oklch").coords;
		let deltas = inputColor.to("oklch").coords.map((c, i) => mappedColorLCH[i] - c);
		deltasMap.set(cssColor, deltas);
		stats.innerHTML = deltas.map((delta, i) => {
			if (minDeltas[i].value > Math.abs(delta)) {
				minDeltas[i] = {value: Math.abs(delta), stats, index: i};
			}

			delta = Color.util.toPrecision(delta, 2);
			let cl = delta < 0? "negative" : delta > 0? "positive" : "zero";
			return `<dt>Δ${ lch[i] }</dt><dd class="${ cl }">${ delta }</dd>`
		}).join("");
	}

	// Find min deltas
	for (let minDelta of minDeltas) {
		// 0 -> 1, 1 -> 3, 2 -> 5
		let dd = minDelta.stats.children[minDelta.index * 2 + 1];
		dd.classList.add("min");
	}
});

let params = new URLSearchParams(location.search);
let color = params.get("color");

if (color) {
	css_color.value = color;
}

css_color_input.dispatchEvent(new InputEvent("input"));



function colorUpdated () {
	let input = css_color_input;

	// Update URL to create a permalink
	let params = new URLSearchParams(location.search);
	let hadColor = params.has("color");
	let value = input.value;
	let defaultValue = input.getAttribute("value");

	if (value !== defaultValue) {
		params.set("color", value);
	}
	else {
		params.delete("color");
	}

	history[hadColor == params.has("color") ? "replaceState" : "pushState"](null, "", "?" + params.toString());

	// Update favicon
	favicon.href = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="${ encodeURIComponent(value) }" /></svg>`;

	// Update title
	document.title = value + " • Gamut Mapping Playground";
}