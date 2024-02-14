import Color from "../../dist/color.js";
import methods from "./methods.js";

globalThis.Color = Color;

const favicon = document.querySelector('link[rel="shortcut icon"]');
const lch = ["L", "C", "H"];

for (let method in methods) {
	let config = methods[method];
	let label = config.label ?? method[0].toUpperCase() + method.slice(1);

	gamut_mapped.insertAdjacentHTML("beforeend", `
		<div>
			<dt>
				${ label }
				${ config.description? `<small class="description">${ config.description }</small>` : "" }
			</dd>
			<dd>
				<css-color swatch="large" data-method="${ method }"></css-color>
			</dd>
		</div>`);
}

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

	let minDeltas;

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

		minDeltas ??= [];

		let mappedColor;

		let methodConfig = methods[method];

		if (methodConfig.compute) {
			mappedColor = methodConfig.compute(inputColor);
		}
		else {
			mappedColor = color.toGamut({ method });
		}

		cssColor.color = mappedColor;

		// Show deltas
		let deltas = getDeltas(inputColor, mappedColor, minDeltas, stats);

		stats.innerHTML = deltas.map((delta, i) => {
			let cl = delta < 0? "negative" : delta > 0? "positive" : "zero";
			return `<dt>Δ${ lch[i] }</dt><dd class="${ cl }">${ delta }</dd>`
		}).join("");
	}

	// Find min deltas
	if (minDeltas) {
		for (let minDelta of minDeltas) {
			let index = minDelta.index * 2 + 1;
			for (let dl of [].concat(minDelta.stats)) {
				let dd = dl.children[minDelta.index * 2 + 1];
				dd.classList.add("min");
			}
		}
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

function getDeltas (inputColor, mappedColor, minDeltas, stats) {
	let mappedColorLCH = mappedColor.to("oklch").coords;
	let deltas = inputColor.to("oklch").coords.map((c, i) => {
		let delta = mappedColorLCH[i] - c;

		if (i === 2) {
			// Hue is angular, so we need to normalize it
			delta = (delta + 720) % 360;
			delta = delta > 180 ? 360 - delta : delta;
		}

		delta = Color.util.toPrecision(delta, 2);

		let minDelta = minDeltas[i];
		if (!minDelta || minDelta.value >= Math.abs(delta)) {
			if (minDelta && minDelta.value == Math.abs(delta)) {
				minDelta.stats = [].concat(minDelta.stats);
				minDelta.stats.push(stats);
			}
			else {
				minDeltas[i] = {value: Math.abs(delta), stats, index: i};
			}

		}

		return delta;
	})
	return deltas;
}