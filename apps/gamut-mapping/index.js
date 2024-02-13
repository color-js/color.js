import Color from "../../dist/color.js";

globalThis.Color = Color;

const favicon = document.querySelector('link[rel="shortcut icon"]');

css_color_input.addEventListener("input", evt => {
	if (css_color.color === null) {
		// Probably typing
		return;
	}

	colorUpdated()

	let p3color = css_color.color.to("p3");
	let p3Linear = css_color.color.to("p3-linear");

	to_p3.color = p3color;
	to_p3linear.color = p3Linear;

	for (let cssColor of gamut_mapped.querySelectorAll("css-color")) {
		let method = cssColor.dataset.method;
		let color = p3color.clone();

		if (color.inGamut("p3")) {
			cssColor.color = color;
			continue;
		}

		if (method === "scale") {
			let deltas = p3Linear.coords.map(c => c - .5);
			let distances = deltas.map(c => Math.abs(c));
			let max = Math.max(...distances);
			let factor = max / .5;

			let mapped = deltas.map((delta, i) => {
				let scaled = delta / factor;
				return scaled + .5
			});

			cssColor.color = new Color("p3-linear", mapped).to("p3");
		}
		else {
			cssColor.color = color.toGamut({ method });
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