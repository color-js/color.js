import Color from "../../dist/color.js";
import { WHITES } from "../../src/adapt.js";

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
		description: "Runs Scale, sets L, H to those of the original color, then runs Scale again.",
		compute: (color) => {
			let mappedColor = methods.scale.compute(color);
			let lch = color.to("oklch").coords;
			mappedColor.set({
				"oklch.l": lch[0],
				"oklch.h": lch[2],
			});
			return methods.scale.compute(mappedColor);
		},
	},
	"scale-lh2": {
		label: "Scale LH 2",
		description: "Identical to Scale LH 2, and handles L=0/1, and noop if already in gamut.",
		compute: (color) => {
			if (color.inGamut("p3")) {
				return color.to("p3");
			}
			let [lightness] = color.to("oklch").coords;
			if (lightness >= 1) {
				return new Color({ space: "xyz-d65", coords: WHITES["D65"] }).to("p3");
			}
			else if (lightness <= 0) {
				return new Color({ space: "xyz-d65", coords: [0, 0, 0] }).to("p3");
			}
			let mappedColor = methods.scale.compute(color);
			let lch = color.to("oklch").coords;
			mappedColor.set({
				"oklch.l": lch[0],
				"oklch.h": lch[2],
			});
			// Do not early return if in-gamut already at this point.
			// The second scale step gets the color closer to the original.
			mappedColor = methods.scale.compute(mappedColor);
			if (mappedColor.inGamut("p3")) {
				return mappedColor;
			}
			// Are we mathematically guaranteed to be in gamut at this point?
			// If not, would a clip suffice?
			return mappedColor;

		},
	},
	"scale": {
		label: "Scale",
		description: "Using a midpoint of 0.5, scale the color to fit within the linear P3 gamut.",
		compute: (color) => {
			// Make in gamut range symmetrical around 0 [-0.5, 0.5] instead of [0, 1]
			let deltas = color.to("p3-linear").coords.map(c => c - .5);

			let maxDistance = Math.max(...deltas.map(c => Math.abs(c)));
			let scalingFactor = maxDistance / .5;

			let scaledCoords = deltas.map((delta, i) => {
				let scaled = delta / scalingFactor;
				return scaled + .5;
			});

			return new Color("p3-linear", scaledCoords).to("p3");
		},
	},
	// "scale125": {
	// 	label: "Scale from 0.125",
	// 	description: "Using a midpoint of 0.125 (perceptual midpoint per Oklab), scale the color to fit within the linear P3 gamut using different scaling factors for values below and above the midpoint.",
	// 	compute: (color) => {
	// 		let p3Linear = color.to("p3-linear");
	// 		let deltas = p3Linear.coords.map(c => c - .125); /* in-gamut range is now -.125 to .875 */
	// 		let max = [Math.min(...deltas.filter(c => c < 0)), Math.max(...deltas.filter(c => c > 0))];
	// 		let factor = [max[0] / .125, max[1] / .875];

	// 		let mapped = deltas.map((delta, i) => {
	// 			if (delta === 0) {
	// 				return .125;
	// 			}
	// 			else if (delta < 0) {
	// 				let scaled = delta / factor[0];
	// 				return scaled + .125;
	// 			}
	// 			else {
	// 				let scaled = delta / factor[1];
	// 				return scaled + .125;
	// 			}
	// 		});

	// 		return new Color("p3-linear", mapped).to("p3");
	// 	}
	// },
};

export default methods;
