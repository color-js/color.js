import Color from "../../dist/color.js";
import { WHITES } from "../../src/adapt.js";
import * as util from "../../src/util.js";
import { makeEdgeSeeker } from "./edge-seeker/makeEdgeSeeker.js";

// Make a function to get the maximum chroma for a given lightness and hue
// Lookup table is created once and reused
const p3EdgeSeeker = makeEdgeSeeker((r, g, b) => {
	const [l, c, h = 0] = new Color("p3", [r, g, b]).to("oklch").coords;
	return { l, c, h };
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
	"chromium": {
		label: "Chromium",
		description: "A port of the 'baked-in' Chromium implementation, mapping to an approximation of the rec2020 gamut.",
		compute: (color) => {
			// Implementation difference: The reference algorithm does not appear to
			// return early for in-gamut colors.
			if (color.inGamut("rec2020")) {
				return color;
			}
			const oklab = color.to("oklab");
			const [l, a, b] = oklab.coords;
			// Constants for the normal vector of the plane formed by white, black, and
			// the specified vertex of the gamut.
			const normal_R = [0.409702, -0.912219];
			const normal_M = [-0.397919, -0.917421];
			const normal_B = [-0.906800, 0.421562];
			const normal_C = [-0.171122, 0.985250];
			const normal_G = [0.460276, 0.887776];
			const normal_Y = [0.947925, 0.318495];

			// For the triangles formed by white (W) or black (K) with the vertices
			// of Yellow and Red (YR), Red and Magenta (RM), etc, the constants to be
			// used to compute the intersection of a line of constant hue and luminance
			// with that plane.
			const c0_YR = 0.091132;
			const cW_YR = [0.070370, 0.034139];
			const cK_YR = [0.018170, 0.378550];
			const c0_RM = 0.113902;
			const cW_RM = [0.090836, 0.036251];
			const cK_RM = [0.226781, 0.018764];
			const c0_MB = 0.161739;
			const cW_MB = [-0.008202, -0.264819];
			const cK_MB = [0.187156, -0.284304];
			const c0_BC = 0.102047;
			const cW_BC = [-0.014804, -0.162608];
			const cK_BC = [-0.276786, 0.004193];
			const c0_CG = 0.092029;
			const cW_CG = [-0.038533, -0.001650];
			const cK_CG = [-0.232572, -0.094331];
			const c0_GY = 0.081709;
			const cW_GY = [-0.034601, -0.002215];
			const cK_GY = [0.012185, 0.338031];

			const L = l;
			const one_minus_L = 1.0 - L;
			const ab = [a, b];

			// Find the planes to intersect with and set the constants based on those
			// planes.
			let c0 = 0;
			let cW = [0, 0];
			let cK = [0, 0];
			const dot = (a, b) => a[0] * b[0] + a[1] * b[1];

			if (dot(ab, normal_R) < 0.0) {
				if (dot(ab, normal_G) < 0.0) {
					if (dot(ab, normal_C) < 0.0) {
						c0 = c0_BC;
						cW = cW_BC;
						cK = cK_BC;
					}
					else {
						c0 = c0_CG;
						cW = cW_CG;
						cK = cK_CG;
					}
				}
				else {
					if (dot(ab, normal_Y) < 0.0) {
						c0 = c0_GY;
						cW = cW_GY;
						cK = cK_GY;
					}
					else {
						c0 = c0_YR;
						cW = cW_YR;
						cK = cK_YR;
					}
				}
			}
			else {
				if (dot(ab, normal_B) < 0.0) {
					if (dot(ab, normal_M) < 0.0) {
						c0 = c0_RM;
						cW = cW_RM;
						cK = cK_RM;
					}
					else {
						c0 = c0_MB;
						cW = cW_MB;
						cK = cK_MB;
					}
				}
				else {
					c0 = c0_BC;
					cW = cW_BC;
					cK = cK_BC;
				}
			}

			// Perform the intersection.
			let alpha = 1;

			// Intersect with the plane with white.
			const w_denom = dot(cW, ab);
			if (w_denom > 0) {
				const w_num = c0 * one_minus_L;
				if (w_num < w_denom) {
					alpha = Math.min(alpha, w_num / w_denom);
				}
			}

			// Intersect with the plane with black.
			let k_denom = dot(cK, ab);
			if (k_denom > 0) {
				const k_num = c0 * L;
				if (k_num < k_denom) {
					alpha = Math.min(alpha, k_num / k_denom);
				}
			}

			// Attenuate the ab coordinate by alpha.
			return oklab.set({a: alpha * a, b: alpha * b})
			// Implementation difference: The reference algorithm does not include a
			// final clip, so some resulting colors may be outside of `rec2020`, and
			// here we clip to p3 for comparison with other methods.
				.toGamut({method: "clip", space: "p3"});
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
			let [light, chroma, hue] = mapColor.coords;
			mapColor.c = 0;
			let achroma = mapColor.to("p3-linear").coords;
			mapColor.c = chroma;
			mapColor = mapColor.to("p3-linear");
			let raytrace = methods.raytrace.raytrace_box;

			// Cast a ray from the zero chroma color to the target color.
			// Trace the line to the RGB cube edge and find where it intersects.
			// Correct L and h within the perceptual OkLCh after each attempt.
			for (let i = 0; i < 4; i++) {
				if (i) {
					const oklch = mapColor.oklch;
					oklch.l = light;
					oklch.h = hue;
				}
				const intersection = raytrace(achroma, mapColor.coords);
				if (intersection.length) {
					mapColor.setAll(mapColor.space, intersection);
					continue;
				}

				// If there was no change, we are done
				break;
			}

			// Remove noise from floating point math by clipping
			let coords = mapColor.coords;
			mapColor.setAll(
				mapColor.space,
				[
					util.clamp(0.0, coords[0], 1.0),
					util.clamp(0.0, coords[1], 1.0),
					util.clamp(0.0, coords[2], 1.0),
				],
			);

			return mapColor.to("p3");
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

			// Result should be finite
			if (!isFinite(tnear)) {
				return [];
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
			return new Color("oklch", [l, c, h]).toGamut({ space: "p3", method: "clip" });
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
