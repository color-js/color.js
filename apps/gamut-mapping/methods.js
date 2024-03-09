import Color from "../../dist/color.js";
import { WHITES } from "../../src/adapt.js";
import * as util from "../../src/util.js";
import { makeEdgeSeeker } from "./edge-seeker/makeEdgeSeeker.js";

// Make a function to get the maximum chroma for a given lightness and hue
// Lookup table is created once and reused
const p3EdgeSeeker = makeEdgeSeeker((r, g, b) => {
	const [l, c, h = 0] = new Color("p3", [r, g, b]).to("oklch").coords;
	return {l, c, h};
});

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
	"raytrace": {
		label: "Raytrace",
		description: "Uses ray tracing to find a color with reduced chroma on the RGB surface.",
		compute: (color) => {
			if (color.inGamut("p3", { epsilon: 0 })) {
				return color.to("p3");
			}

			let mapColor = color.to("oklch");
			let lightness = mapColor.coords[0];

			if (lightness >= 1) {
				return new Color({ space: "xyz-d65", coords: WHITES["D65"] }).to("p3");
			}
			else if (lightness <= 0) {
				return new Color({ space: "xyz-d65", coords: [0, 0, 0] }).to("p3");
			}
			return methods.raytrace.trace(mapColor);
		},
		trace: (mapColor) => {
			let gamutColor = mapColor.to("p3-linear");
			let achroma = mapColor.set("c", 0).to("p3-linear").coords;
			let raytrace = methods.raytrace.raytrace_box;

			// Cast a ray from the zero chroma color to the target color.
			// Trace the line to the RGB cube edge and find where it intersects.
			// Correct L and h within the perceptual OkLCh after each attempt.
			let light = mapColor.coords[0];
			let hue = mapColor.coords[2];
			for (let i = 0; i < 3; i++) {
				const intersection = raytrace(achroma, gamutColor.coords);
				if (intersection.length) {
					gamutColor.setAll(gamutColor.space, intersection);
					const oklch = gamutColor.oklch;
					oklch.l = light;
					oklch.h = hue;
					continue;
				}

				// If there was no change, we are done
				break;
			}

			// Remove noise from floating point math by clipping
			let coords = gamutColor.coords;
			gamutColor.setAll(
				gamutColor.space,
				[
					util.clamp(0.0, coords[0], 1.0),
					util.clamp(0.0, coords[1], 1.0),
					util.clamp(0.0, coords[2], 1.0)
				]
			);

			return gamutColor.to("p3");
		},
		raytrace_box: (start, end, bmin = [0, 0, 0], bmax = [1, 1, 1]) => {
			// Use slab method to detect intersection of ray and box and return intersect.
			// https://en.wikipedia.org/wiki/Slab_method

			// Calculate whether there was a hit
			let tfar = Infinity;
			let tnear = -Infinity;
			let direction = [];

			for (let i = 0; i < 3; i++) {
				const a = start[i];
				const b = end[i];
				const d = b - a;
				const bn = bmin[i];
				const bx = bmax[i];
				direction.push(d);

				// Non parallel cases
				if (d != 0) {
					const inv_d = 1 / d;
					const t1 = (bn - a) * inv_d;
					const t2 = (bx - a) * inv_d;
					tnear = Math.max(Math.min(t1, t2), tnear);
					tfar = Math.min(Math.max(t1, t2), tfar);
				}

				// Impossible parallel case
				else if (a < bn || a > bx) {
					return [];
				}
			}

			// No hit
			if (tnear > tfar || tfar < 0) {
				return [];
			}

			// Favor the intersection first in the direction start -> end
			if (tnear < 0) {
				tnear = tfar;
			}

			// Calculate nearest intersection via interpolation
			return [
				start[0] + direction[0] * tnear,
				start[1] + direction[1] * tnear,
				start[2] + direction[2] * tnear,
			];
		},
	},
	"edge-seeker": {
		label: "Edge Seeker",
		description: "Using a LUT to detect edges of the gamut and reduce chroma accordingly.",
		compute: (color) => {
			let [l, c, h] = color.to("oklch").coords;
			if (l <= 0) {
				return new Color("oklch", [0, 0, h]);
			}
			if (l >= 1) {
				return new Color("oklch", [1, 0, h]);
			}
			let maxChroma = p3EdgeSeeker(l, h || 0);
			if (c > maxChroma) {
				c = maxChroma;
			}
			// At this point it is safe to clip the values
			return new Color("oklch", [l, c, h]).toGamut({space: "p3", method: "clip"});
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
