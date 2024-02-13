import Color from "../../dist/color.js";

globalThis.Color = Color;

color_input.addEventListener("input", evt => {
	let p3color = input_color.color.to("p3");
	let p3Linear = input_color.color.to("p3-linear");

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

color_input.dispatchEvent(new InputEvent("input"));