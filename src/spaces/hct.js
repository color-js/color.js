import ColorSpace from "../ColorSpace.js";
import { constrain } from "../angles.js";
import xyz_d65 from "./xyz-d65.js";
import { fromCam16, toCam16, environment } from "./cam16.js";
import { WHITES } from "../adapt.js";

const white = WHITES.D65;
const ε = 216 / 24389; // 6^3/29^3 == (24/116)^3
const κ = 24389 / 27; // 29^3/3^3
// Average constant for the approximation of the first derivative: α * y / j
// α is calculated average so that it is optimized for the majority of the cases.
const α = 1.832;

function toLstar (y) {
	// Convert XYZ Y to L*

	const fy = y > ε ? Math.cbrt(y) : (κ * y + 16) / 116;
	return 116.0 * fy - 16.0;
}

function fromLstar (lstar) {
	// Convert L* back to XYZ Y

	return lstar > 8 ? Math.pow((lstar + 16) / 116, 3) : lstar / κ;
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

	// Shortcut out for black
	if (t === 0) {
		return [0.0, 0.0, 0.0];
	}

	// Calculate the Y we need to target
	let y = fromLstar(t);

	// A better initial guess yields better results. Polynomials come from
	// curve fitting the T vs J response.
	const [wx, wy] = white;
	let j = toCam16([(wx * y) / wy, y, ((1.0 - wx - wy) * y) / wy], env).J;

	// Threshold of how close is close enough, and max number of attempts.
	// More precision and more attempts means more time spent iterating. Higher
	// required precision gives more accuracy but also increases the chance of
	// not hitting the goal.
	const epsilon = 1e-12;
	const max_attempts = 8;

	let attempt = 0;
	let last = Infinity;
	let best = [0, 0, 0];

	// Try to find a J such that the returned y matches the returned y of the L*
	while (attempt < max_attempts) {
		attempt += 1;
		const prev = j;
		xyz = fromCam16({ J: j, C: c, h: h }, env);

		const dy = xyz[1] - y;
		const delta = Math.abs(dy);
		if (delta < last) {
			// If we are within range, return XYZ
			if (delta < epsilon) {
				return xyz;
			}

			// If we are closer than last time, save the values.
			// This is to ensure we take the best value when
			// iterations are struggling to find a good value,
			// e.g. Prophoto RGB in the blue region which is outside
			// the visible spectrum and the CAM16 algorithm breaks down.
			best = xyz;
			last = delta;
		}

		// Newton: 2nd Order convergence
		// First derivative approximation of J'
		const jp = j ? (α * xyz[1]) / j : 0;
		if (Math.abs(jp) < epsilon) {
			break;
		}
		j -= dy / jp;

		// Ostrowski: 4th order convergence
		if (jp) {
			const xyz2 = fromCam16({ J: j, C: c, h: h }, env);
			const dy2 = xyz2[1] - y;
			const denom = dy - 2 * dy2;
			if (Math.abs(denom) >= epsilon) {
				j -= (dy / denom) * (dy2 / jp);
			}
		}

		// Quit if there has been little to no change
		if (Math.abs(j - prev) < epsilon) {
			break;
		}
	}

	// We could not acquire the precision we desired,
	// return our closest attempt.
	return best;
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
	white,
	(200 / Math.PI) * fromLstar(50.0),
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
		if (this.ε === undefined) {
			this.ε = Object.values(this.coords)[1].refRange[1] / 100000;
		}
		let hct = toHct(xyz, viewingConditions);
		if (hct[1] < this.ε) {
			hct[1] = 0.0;
			hct[0] = null;
		}
		return hct;
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
