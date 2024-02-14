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
			let deltas = p3Linear.coords.map(c => c - .5); /* in-gamut range is now -.5 to .5 */
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
	"scale2": {
		label: "Scale 2",
		description: "Using a midpoint of 0.125 (perceptual midpoint per Oklab), scale the color to fit within the linear P3 gamut.",
		compute: (p3Linear) => {
			let deltas = p3Linear.coords.map(c => c - .125); /* in-gamut range is now -.125 to .875 */
			let max = [Math.min(...deltas.filter(c => c < 0)), Math.max(...deltas.filter(c => c > 0))];
			let factor = [max[0] / .125, max[1] / .875];

			let mapped = deltas.map((delta, i) => {
				if (delta === 0) {
					return .125;
				}
				else if (delta < 0) {
					let scaled = delta / factor[0];
					return scaled + .125;
				}
				else {
					let scaled = delta / factor[1];
					return scaled + .125;
				}
			});

			return new Color("p3-linear", mapped).to("p3");
		}
	},
};