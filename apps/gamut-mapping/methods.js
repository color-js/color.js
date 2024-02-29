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
			if (color.inGamut("p3", { epsilon: 0 })) {
				return color;
			}
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
			let achroma = mapColor.clone().set("c", 0).to("p3-linear").coords;
			let gamutColor = mapColor.clone().to("p3-linear");

			// Create a line from our color to color with zero lightness.
			// Trace the line to the RGB cube finding the face and the point where it intersects.
			// Take two rounds to get us as close as we can get.
			let size = [1, 1, 1];
			let coords;
			let [xa, ya, za] = achroma;
			for (let i = 0; i < 3; i++) {
				// On subsequent runs correct L and H before continuing and
				// then extend the vector in case we are now under saturated
				if (i) {
					gamutColor.set({"oklch.l": mapColor.coords[0], "oklch.h": mapColor.coords[2]});
					let [r, g, b] = gamutColor.coords;
					coords = [xa + (r - xa) * 100, ya + (g - ya) * 100, za + (b - za) * 100];
				}
				else {
					coords = gamutColor.coords;
				}
				let [face, intersection] = methods.raytrace.raytrace_box(size, coords, achroma);
				if (face) {
					gamutColor.setAll(gamutColor.space, intersection);
					continue;
				}

				// If there was no change, we are done
				break;
			}

			return gamutColor.to("p3");
		},
		raytrace_box: (size, start, end) => {
			// Returns the face and the intersection point as a tuple, with
			// - 0: None, (point is None)
			// - 1: intersection with x==0 face,
			// - 2: intersection with x==size[0] face,
			// - 3: intersection with y==0 face,
			// - 4: intersection with y==size[1] face,
			// - 5: intersection with z==0 face,
			// - 6: intersection with z==size[2] face,
			// that the ray from start to end intersects first,
			// given an axis-aligned box (0,0,0)-(size[0],size[1],size[2]).
			// https://math.stackexchange.com/a/3775967

			// Negated deltas
			let ndx = start[0] - end[0];
			let ndy = start[1] - end[1];
			let ndz = start[2] - end[2];

			// Sizes scaled by the negated deltas
			let sxy = ndx * size[1];
			let sxz = ndx * size[2];
			let syx = ndy * size[0];
			let syz = ndy * size[2];
			let szx = ndz * size[0];
			let szy = ndz * size[1];

			// Cross terms
			let cxy = end[0] * start[1] - end[1] * start[0];
			let cxz = end[0] * start[2] - end[2] * start[0];
			let cyz = end[1] * start[2] - end[2] * start[1];

			// Absolute delta products
			let axy = Math.abs(ndx * ndy);
			let axz = Math.abs(ndx * ndz);
			let ayz = Math.abs(ndy * ndz);
			let axyz = Math.abs(ndz * axy);

			// Default to "no intersection"
			let face_num = 0;
			let face_tau = Math.abs(ndz * axy);
			let tau = 0;

			if (start[0] < 0 && 0 < end[0]) {
				// Face 1: x == 0
				tau = -start[0] * ayz;
				if (tau < face_tau && cxy >= 0 && cxz >= 0 && cxy <= -sxy && cxz <= -sxz) {
					face_tau = tau;
					face_num = 1;
				}
			}

			else if (end[0] < size[0] && size[0] < start[0]) {
				// Face 2: x == size[0]
				tau = (start[0] - size[0]) * ayz;
				if (tau < face_tau && cxy <= syx && cxz <= szx && cxy >= syx - sxy && cxz >= szx - sxz) {
					face_tau = tau;
					face_num = 2;
				}
			}

			if (start[1] < 0 && end[1] > 0) {
				// Face 3: y == 0
				tau = -start[1] * axz;
				if (tau < face_tau && cxy <= 0 && cyz >= 0 && cxy >= syx && cyz <= -syz) {
					face_tau = tau;
					face_num = 3;
				}
			}

			else if (start[1] > size[1] && end[1] < size[1]) {
				// Face 4: y == size[1]
				tau = (start[1] - size[1]) * axz;
				if (tau < face_tau && cxy >= -sxy && cyz <= szy && cxy <= syx - sxy && cyz >= szy - syz) {
					face_tau = tau;
					face_num = 4;
				}
			}

			if (start[2] < 0 && end[2] > 0) {
				// Face 5: z == 0
				tau = -start[2] * axy;
				if (tau < face_tau && cxz <= 0 && cyz <= 0 && cxz >= szx && cyz >= szy) {
					face_tau = tau;
					face_num = 5;
				}
			}

			else if (start[2] > size[2] && end[2] < size[2]) {
				// Face 6: z == size[2]
				tau = (start[2] - size[2]) * axy;
				if ((tau < face_tau && cxz >= -sxz && cyz >= -syz && cxz <= szx - sxz && cyz <= szy - syz)) {
					face_tau = tau;
					face_num = 6;
				}
			}

			if (face_num > 0) {
				const tend = face_tau / axyz;
				const tstart = 1.0 - tend;
				return [
					face_num,
					[
						tstart * start[0] + tend * end[0],
						tstart * start[1] + tend * end[1],
						tstart * start[2] + tend * end[2],
					],
				];
			}
			return [0, []];
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
