import ColorSpace from "../space.js";
import {constrain} from "../angles.js";
import xyz_d65 from "./xyz-d65.js";
import {fromCam16, toCam16, environment} from "./cam16.js";
import {WHITES} from "../adapt.js";

const white = WHITES.D65;
const ε = 216 / 24389;  // 6^3/29^3 == (24/116)^3
const κ = 24389 / 27;   // 29^3/3^3

function toLstar (y) {
	// Convert XYZ Y to L*

	const fy = (y > ε) ? Math.cbrt(y) : (κ * y + 16) / 116;
	return (116.0 * fy) - 16.0;
}

function fromLstar (lstar) {
	// Convert L* back to XYZ Y

	return (lstar > 8) ?  Math.pow((lstar + 16) / 116, 3) : lstar / κ;
}

function fromHct (coords, env) {
	// Use Newton's method to try and converge as quick as possible or
	// converge as close as we can. While the requested precision is achieved
	// most of the time, it may not always be achievable. Especially past the
	// visible spectrum, the algorithm will likely struggle to get the same
	// precision. If, for whatever reason, we cannot achieve the accuracy we
	// seek in the allotted iterations, just return the closest we were able to
	// get.

	let [h, c, t] = coords;
	let xyz = [];
	let j = 0;

	// Shortcut out for black
	if (t === 0) {
		return [0.0, 0.0, 0.0];
	}

	// Calculate the Y we need to target
	let y = fromLstar(t);

	// A better initial guess yields better results. Polynomials come from
	// curve fitting the T vs J response.
	if (t > 0) {
		j = 0.00379058511492914 * t ** 2 + 0.608983189401032 * t + 0.9155088574762233;
	}
	else {
		j = 9.514440756550361e-06 * t ** 2 + 0.08693057439788597 * t - 21.928975842194614;
	}

	// Threshold of how close is close enough, and max number of attempts.
	// More precision and more attempts means more time spent iterating. Higher
	// required precision gives more accuracy but also increases the chance of
	// not hitting the goal. 2e-12 allows us to convert round trip with
	// reasonable accuracy of six decimal places or more.
	const threshold = 2e-12;
	const max_attempts = 15;

	let attempt = 0;
	let last = Infinity;
	let best = j;

	// Try to find a J such that the returned y matches the returned y of the L*
	while (attempt <= max_attempts) {
		xyz = fromCam16({J: j, C: c, h: h}, env);

		// If we are within range, return XYZ
		// If we are closer than last time, save the values
		const delta = Math.abs(xyz[1] - y);
		if (delta < last) {
			if (delta <= threshold) {
				return xyz;
			}
			best = j;
			last = delta;
		}

		// f(j_root) = (j ** (1 / 2)) * 0.1
		// f(j) = ((f(j_root) * 100) ** 2) / j - 1 = 0
		// f(j_root) = Y = y / 100
		// f(j) = (y ** 2) / j - 1
		// f'(j) = (2 * y) / j
		j = j - (xyz[1] - y) * j / (2 * xyz[1]);

		attempt += 1;
	}

	// We could not acquire the precision we desired,
	// return our closest attempt.
	return fromCam16({J: j, C: c, h: h}, env);
}

function toHct (xyz, env) {
	// Calculate HCT by taking the L* of CIE LCh D65 and CAM16 chroma and hue.

	const t = toLstar(xyz[1]);
	if (t === 0.0) {
		return [0.0, 0.0, 0.0];
	}
	const cam16 = toCam16(xyz, viewingConditions);
	return [constrain(cam16.h), cam16.C, t];
}

// Pre-calculate everything we can with the viewing conditions
export const viewingConditions = environment(
	white, 200 / Math.PI * fromLstar(50.0),
	fromLstar(50.0) * 100,
	"average",
	false,
);

// https://material.io/blog/science-of-color-design
// This is not a port of the material-color-utilities,
// but instead implements the full color space as described,
// combining CAM16 JCh and Lab D65. This does not clamp conversion
// to HCT to specific chroma bands and provides support for wider
// gamuts than Google currently supports and does so at a greater
// precision (> 8 bits back to sRGB).
// This implementation comes from https://github.com/facelessuser/coloraide
// which is licensed under MIT.
export default new ColorSpace({
	id: "hct",
	name: "HCT",
	coords: {
		h: {
			refRange: [0, 360],
			type: "angle",
			name: "Hue",
		},
		c: {
			refRange: [0, 145],
			name: "Colorfulness",
		},
		t: {
			refRange: [0, 100],
			name: "Tone",
		},
	},

	base: xyz_d65,

	fromBase (xyz) {
		return toHct(xyz, viewingConditions);
	},
	toBase (hct) {
		return fromHct(hct, viewingConditions);
	},
	formats: {
		color: {
			id: "--hct",
			coords: ["<number> | <angle>", "<percentage> | <number>", "<percentage> | <number>"],
		},
	},
});
