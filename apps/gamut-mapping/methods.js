import Color from "../../dist/color.js";

export default {
	"clip": {
		label: "Clip",
		description: "Naïve clipping to the P3 gamut.",
	},
	"css": {
		label: "CSS",
		description: "Gamput mapping method from CSS Color 4.",
	},
	"scale": {
		label: "Scale",
		description: "Using a midpoint of 0.5, scale the color to fit within the linear P3 gamut.",
		compute: (p3Linear) => {
			let deltas = p3Linear.coords.map(c => c - .5);
			let distances = deltas.map(c => Math.abs(c));
			let max = Math.max(...distances);
			let factor = max / .5;

			let mapped = deltas.map((delta, i) => {
				let scaled = delta / factor;
				return scaled + .5
			});

			return new Color("p3-linear", mapped).to("p3");
		}
	},
};