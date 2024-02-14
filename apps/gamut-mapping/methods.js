import Color from "../../dist/color.js";

const methods = {
	"clip": {
		label: "Clip",
		description: "Naïve clipping to the P3 gamut.",
	},
	"css": {
		label: "CSS",
		description: "CSS Color 4 gamut mapping method.",
	},
	"scale-lh": {
		label: "Scale LH",
		description: "Like Scale, but sets L, H to those of the original color, and then performs Scale again.",
		compute: (color) => {
			let mappedColor = methods.scale.compute(color);
			let lch = color.to("oklch").coords;
			mappedColor.set("oklch.h", lch[2]);
			mappedColor.set("oklch.l", lch[0]);
			return methods.scale.compute(mappedColor);
		}
	},
	"scale": {
		label: "Scale",
		description: "Using a midpoint of 0.5, scale the color to fit within the linear P3 gamut.",
		compute: (color) => {
			let p3Linear = color.to("p3-linear");
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
	"scale125": {
		label: "Scale from 0.125",
		description: "Using a midpoint of 0.125 (perceptual midpoint per Oklab), scale the color to fit within the linear P3 gamut using different scaling factors for values below and above the midpoint.",
		compute: (color) => {
			let p3Linear = color.to("p3-linear");
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

export default methods;