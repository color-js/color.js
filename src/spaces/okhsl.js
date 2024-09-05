// Okhsl class.
//
// ---- License ----
//
// Copyright (c) 2021 Björn Ottosson
//
// Permission is hereby granted, free of charge, to any person obtaining a copy of
// this software and associated documentation files (the "Software"), to deal in
// the Software without restriction, including without limitation the rights to
// use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
// of the Software, and to permit persons to whom the Software is furnished to do
// so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.
import ColorSpace from "../ColorSpace.js";
import Oklab from "./oklab.js";
import {LabtoLMS_M} from "./oklab.js";
import {spow, multiply_v3_m3x3} from "../util.js";
import {constrain} from "../angles.js";

// Type "imports"
/** @typedef {import("../types.js").Matrix3x3} Matrix3x3 */
/** @typedef {import("../types.js").Vector3} Vector3 */
/** @typedef {import("../types.js").OKCoeff} OKCoeff */

export const tau = 2 * Math.PI;

/** @type {Matrix3x3} */
export const toLMS = [
	[0.4122214694707629, 0.5363325372617349, 0.0514459932675022],
	[0.2119034958178251, 0.6806995506452344, 0.1073969535369405],
	[0.0883024591900564, 0.2817188391361215, 0.6299787016738222],
];

/** @type {Matrix3x3} */
export const toSRGBLinear = [
	[ 4.0767416360759583, -3.3077115392580629,  0.2309699031821043],
	[-1.2684379732850315,  2.6097573492876882, -0.3413193760026570],
	[-0.0041960761386756, -0.7034186179359362,  1.7076146940746117],
];

/** @type {OKCoeff} */
export const RGBCoeff = [
	// Red
	[
		// Limit
		[-1.8817031, -0.80936501],
		// `Kn` coefficients
		[1.19086277, 1.76576728, 0.59662641, 0.75515197, 0.56771245],
	],
	// Green
	[
		// Limit
		[1.8144408, -1.19445267],
		// `Kn` coefficients
		[0.73956515, -0.45954404, 0.08285427, 0.12541073, -0.14503204],
	],
	// Blue
	[
		// Limit
		[0.13110758, 1.81333971],
		// `Kn` coefficients
		[1.35733652, -0.00915799, -1.1513021, -0.50559606, 0.00692167],
	],
];

const floatMax = Number.MAX_VALUE;
const K1 = 0.206;
const K2 = 0.03;
const K3 = (1.0 + K1) / (1.0 + K2);


function vdot (a, b) {
	// Dot two vectors

	let l = a.length;
	if (l !== b.length) {
		throw new Error(`Vectors of size ${l} and ${b.length} are not aligned`);
	}

	let s = 0.0;
	a.forEach((c, i) => {
		s += c * b[i];
	});

	return s;
}


/**
 * Toe function for L_r
 * @param {number} x
 */
export function toe (x) {
	return 0.5 * (K3 * x - K1 + Math.sqrt((K3 * x - K1) * (K3 * x - K1) + 4 * K2 * K3 * x));
}


/**
 * Inverse toe function for L_r
 * @param {number} x
 */
export function toeInv (x) {
	return (x ** 2 + K1 * x) / (K3 * (x + K2));
}


/**
 * @param {readonly [number, number]} cusp
 * @returns {[number, number]}
 */
export function toSt (cusp) {
	// To ST.

	let [l, c] = cusp;
	return [c / l, c / (1 - l)];
}


function getStMid (a, b) {
	// Returns a smooth approximation of the location of the cusp.
	//
	// This polynomial was created by an optimization process.
	// It has been designed so that S_mid < S_max and T_mid < T_max.


	let s = 0.11516993 + 1.0 / (
		7.44778970 + 4.15901240 * b +
		a * (
			-2.19557347 + 1.75198401 * b +
			a * (
				-2.13704948 - 10.02301043 * b +
				a * (
					-4.24894561 + 5.38770819 * b + 4.69891013 * a
				)
			)
		)
	);

	let t = 0.11239642 + 1.0 / (
		1.61320320 - 0.68124379 * b +
		a * (
			0.40370612 + 0.90148123 * b +
			a * (
				-0.27087943 + 0.61223990 * b +
				a * (
					0.00299215 - 0.45399568 * b - 0.14661872 * a
				)
			)
		)
	);

	return [s, t];
}

/**
 * @param {Vector3} lab
 * @param {Matrix3x3} lmsToRgb
 */
export function oklabToLinearRGB (lab, lmsToRgb) {
	// Convert from Oklab to linear RGB.
	//
	// Can be any gamut as long as `lmsToRgb` is a matrix
	// that transform the LMS values to the linear RGB space.

	let lms = multiply_v3_m3x3(lab, LabtoLMS_M);

	lms[0] = lms[0] ** 3;
	lms[1] = lms[1] ** 3;
	lms[2] = lms[2] ** 3;

	return multiply_v3_m3x3(lms, lmsToRgb, lms);
}

/**
 * @param {number} a
 * @param {number} b
 * @param {Matrix3x3} lmsToRgb
 * @param {OKCoeff} okCoeff
 * @returns {[number, number]}
 * @todo Could probably make these types more specific/better-documented if desired
 */
export function findCusp (a, b, lmsToRgb, okCoeff) {
	// Finds L_cusp and C_cusp for a given hue.
	//
	// `a` and `b` must be normalized so `a^2 + b^2 == 1`.

	// First, find the maximum saturation (saturation `S = C/L`)
	let sCusp = computeMaxSaturation(a, b, lmsToRgb, okCoeff);

	// Convert to linear RGB to find the first point where at least one of r, g or b >= 1:
	let rgb = oklabToLinearRGB([1, sCusp * a, sCusp * b], lmsToRgb);
	let lCusp = spow(1.0 / Math.max(...rgb), 1 / 3);
	let cCusp = lCusp * sCusp;

	return [lCusp, cCusp];
}


/**
 * @param {number} a
 * @param {number} b
 * @param {number} l1
 * @param {number} c1
 * @param {number} l0
 * @param {Matrix3x3} lmsToRgb
 * @param {OKCoeff} okCoeff
 * @param {[number, number]} cusp
 * @returns {Number}
 * @todo Could probably make these types more specific/better-documented if desired
 */
export function findGamutIntersection (a, b, l1, c1, l0, lmsToRgb, okCoeff, cusp) {
	// Finds intersection of the line.
	//
	// Defined by the following:
	//
	// ```
	// L = L0 * (1 - t) + t * L1
	// C = t * C1
	// ```
	//
	// `a` and `b` must be normalized so `a^2 + b^2 == 1`.

	let t;

	if (cusp === undefined) {
		cusp = findCusp(a, b, lmsToRgb, okCoeff);
	}

	// Find the intersection for upper and lower half separately
	if (((l1 - l0) * cusp[1] - (cusp[0] - l0) * c1) <= 0.0) {
		// Lower half
		t = cusp[1] * l0 / (c1 * cusp[0] + cusp[1] * (l0 - l1));
	}
	else {
		// Upper half

		// First intersect with triangle
		t = cusp[1] * (l0 - 1.0) / (c1 * (cusp[0] - 1.0) + cusp[1] * (l0 - l1));

		// Then one step Halley's method
		let dl = l1 - l0;
		let dc = c1;

		let kl = vdot(LabtoLMS_M[0].slice(1), [a, b]);
		let km = vdot(LabtoLMS_M[1].slice(1), [a, b]);
		let ks = vdot(LabtoLMS_M[2].slice(1), [a, b]);

		let ldt_ = dl + dc * kl;
		let mdt_ = dl + dc * km;
		let sdt_ = dl + dc * ks;

		// If higher accuracy is required, 2 or 3 iterations of the following block can be used:
		let L = l0 * (1.0 - t) + t * l1;
		let C = t * c1;

		let l_ = L + C * kl;
		let m_ = L + C * km;
		let s_ = L + C * ks;

		let l = l_ ** 3;
		let m = m_ ** 3;
		let s = s_ ** 3;

		let ldt = 3 * ldt_ * (l_ ** 2);
		let mdt = 3 * mdt_ * (m_ ** 2);
		let sdt = 3 * sdt_ * (s_ ** 2);

		let ldt2 = 6 * (ldt_ ** 2) * l_;
		let mdt2 = 6 * (mdt_ ** 2) * m_;
		let sdt2 = 6 * (sdt_ ** 2) * s_;

		let r_ = vdot(lmsToRgb[0], [l, m, s]) - 1;
		let r1 = vdot(lmsToRgb[0], [ldt, mdt, sdt]);
		let r2 = vdot(lmsToRgb[0], [ldt2, mdt2, sdt2]);

		let ur = r1 / (r1 * r1 - 0.5 * r_ * r2);
		let tr = -r_ * ur;

		let g_ = vdot(lmsToRgb[1], [l, m, s]) - 1;
		let g1 = vdot(lmsToRgb[1], [ldt, mdt, sdt]);
		let g2 = vdot(lmsToRgb[1], [ldt2, mdt2, sdt2]);

		let ug = g1 / (g1 * g1 - 0.5 * g_ * g2);
		let tg = -g_ * ug;

		let b_ = vdot(lmsToRgb[2], [l, m, s]) - 1;
		let b1 = vdot(lmsToRgb[2], [ldt, mdt, sdt]);
		let b2 = vdot(lmsToRgb[2], [ldt2, mdt2, sdt2]);

		let ub = b1 / (b1 * b1 - 0.5 * b_ * b2);
		let tb = -b_ * ub;

		tr = (ur >= 0.0) ? tr : floatMax;
		tg = (ug >= 0.0) ? tg : floatMax;
		tb = (ub >= 0.0) ? tb : floatMax;

		t += Math.min(tr, Math.min(tg, tb));
	}

	return t;
}


function getCs (lab, lmsToRgb, okCoeff) {
	// Get Cs

	let [l, a, b] = lab;

	let cusp = findCusp(a, b, lmsToRgb, okCoeff);

	let cMax = findGamutIntersection(a, b, l, 1, l, lmsToRgb, okCoeff, cusp);
	let stMax = toSt(cusp);

	// Scale factor to compensate for the curved part of gamut shape:
	let k = cMax / Math.min((l * stMax[0]), (1 - l) * stMax[1]);

	let stMid = getStMid(a, b);

	// Use a soft minimum function, instead of a sharp triangle shape to get a smooth value for chroma.
	let ca = l * stMid[0];
	let cb = (1.0 - l) * stMid[1];
	let cMid = 0.9 * k * Math.sqrt(Math.sqrt(1.0 / (1.0 / (ca ** 4) + 1.0 / (cb ** 4))));

	// For `C_0`, the shape is independent of hue, so `ST` are constant.
	// Values picked to roughly be the average values of `ST`.
	ca = l * 0.4;
	cb = (1.0 - l) * 0.8;

	// Use a soft minimum function, instead of a sharp triangle shape to get a smooth value for chroma.
	let c0 = Math.sqrt(1.0 / (1.0 / (ca ** 2) + 1.0 / (cb ** 2)));

	return [c0, cMid, cMax];
}


function computeMaxSaturation (a, b, lmsToRgb, okCoeff) {
	// Finds the maximum saturation possible for a given hue that fits in RGB.
	//
	// Saturation here is defined as `S = C/L`.
	// `a` and `b` must be normalized so `a^2 + b^2 == 1`.

	// Max saturation will be when one of r, g or b goes below zero.

	// Select different coefficients depending on which component goes below zero first.

	let k0, k1, k2, k3, k4, wl, wm, ws;

	if (vdot(okCoeff[0][0], [a, b]) > 1) {
		// Red component
		[k0, k1, k2, k3, k4] = okCoeff[0][1];
		[wl, wm, ws] = lmsToRgb[0];
	}
	else if (vdot(okCoeff[1][0], [a, b]) > 1) {
		// Green component
		[k0, k1, k2, k3, k4] = okCoeff[1][1];
		[wl, wm, ws] = lmsToRgb[1];
	}
	else {
		// Blue component
		[k0, k1, k2, k3, k4] = okCoeff[2][1];
		[wl, wm, ws] = lmsToRgb[2];
	}

	// Approximate max saturation using a polynomial:
	let sat = k0 + k1 * a + k2 * b + k3 * (a ** 2) + k4 * a * b;

	// Do one step Halley's method to get closer.
	// This gives an error less than 10e6, except for some blue hues where the `dS/dh` is close to infinite.
	// This should be sufficient for most applications, otherwise do two/three steps.

	let kl = vdot(LabtoLMS_M[0].slice(1), [a, b]);
	let km = vdot(LabtoLMS_M[1].slice(1), [a, b]);
	let ks = vdot(LabtoLMS_M[2].slice(1), [a, b]);

	let l_ = 1.0 + sat * kl;
	let m_ = 1.0 + sat * km;
	let s_ = 1.0 + sat * ks;

	let l = l_ ** 3;
	let m = m_ ** 3;
	let s = s_ ** 3;

	let lds = 3.0 * kl * (l_ ** 2);
	let mds = 3.0 * km * (m_ ** 2);
	let sds = 3.0 * ks * (s_ ** 2);

	let lds2 = 6.0 * (kl ** 2) * l_;
	let mds2 = 6.0 * (km ** 2) * m_;
	let sds2 = 6.0 * (ks ** 2) * s_;

	let f = wl * l + wm * m + ws * s;
	let f1 = wl * lds + wm * mds + ws * sds;
	let f2 = wl * lds2 + wm * mds2 + ws * sds2;

	sat = sat - f * f1 / ((f1 ** 2) - 0.5 * f * f2);

	return sat;
}


function okhslToOklab (hsl, lmsToRgb,  okCoeff) {
	// Convert Okhsl to Oklab.

	let [h, s, l] = hsl;
	let L = toeInv(l);
	let a = null;
	let b = null;
	h = constrain(h) / 360.0;

	if (L !== 0.0 && L !== 1.0 && s !== 0) {
		let a_ = Math.cos(tau * h);
		let b_ = Math.sin(tau * h);

		let [c0, cMid, cMax] = getCs([L, a_, b_], lmsToRgb, okCoeff);

		// Interpolate the three values for C so that:
		// ```
		// At s=0: dC/ds = C_0, C=0
		// At s=0.8: C=C_mid
		// At s=1.0: C=C_max
		// ```

		let mid = 0.8;
		let midInv = 1.25;
		let t, k0, k1, k2;

		if (s < mid) {
			t = midInv * s;
			k0 = 0.0;
			k1 = mid * c0;
			k2 = (1.0 - k1 / cMid);
		}
		else {
			t = 5 * (s - 0.8);
			k0 = cMid;
			k1 = 0.2 * (cMid ** 2) * (1.25 ** 2) / c0;
			k2 = 1.0 - k1 / (cMax - cMid);
		}

		let c = k0 + t * k1 / (1.0 - k2 * t);

		a = c * a_;
		b = c * b_;
	}

	return [L, a, b];
}


function oklabToOkhsl (lab, lmsToRgb, okCoeff) {
	// Oklab to Okhsl.

	// Epsilon for lightness should approach close to 32 bit lightness
	// Epsilon for saturation just needs to be sufficiently close when denoting achromatic
	let εL = 1e-7;
	let εS = 1e-4;
	let L = lab[0];
	let s = 0.0;
	let l = toe(L);

	let c = Math.sqrt(lab[1] ** 2 + lab[2] ** 2);
	let h = 0.5 + Math.atan2(-lab[2], -lab[1]) / tau;

	if (l !== 0.0 && l !== 1.0 && c !== 0) {
		let a_ = lab[1] / c;
		let b_ = lab[2] / c;

		let [c0, cMid, cMax] = getCs([L, a_, b_], lmsToRgb, okCoeff);

		let mid = 0.8;
		let midInv = 1.25;
		let k0, k1, k2, t;

		if (c < cMid) {
			k1 = mid * c0;
			k2 = 1.0 - k1 / cMid;

			t = c / (k1 + k2 * c);
			s = t * mid;
		}

		else {
			k0 = cMid;
			k1 = 0.2 * (cMid ** 2) * (midInv ** 2) / c0;
			k2 = (1.0 - (k1) / (cMax - cMid));

			t = (c - k0) / (k1 + k2 * (c - k0));
			s = mid + 0.2 * t;
		}
	}

	const achromatic = Math.abs(s) < εS;
	if (achromatic || l === 0.0 || Math.abs(1 - l) < εL) {
		h = null;
		// Due to floating point imprecision near lightness of 1, we can end up
		// with really high around white, this is to provide consistency as
		// saturation can be really high for white due this imprecision.
		if (!achromatic) {
			s = 0.0;
		}
	}

	else {
		h = constrain(h * 360);
	}

	return [h, s, l];
}


export default new ColorSpace({
	id: "okhsl",
	name: "Okhsl",
	coords: {
		h: {
			refRange: [0, 360],
			type: "angle",
			name: "Hue",
		},
		s: {
			range: [0, 1],
			name: "Saturation",
		},
		l: {
			range: [0, 1],
			name: "Lightness",
		},
	},

	base: Oklab,
	gamutSpace: "self",

	// Convert Oklab to Okhsl
	fromBase (lab) {
		return oklabToOkhsl(lab, toSRGBLinear, RGBCoeff);
	},

	// Convert Okhsl to Oklab
	toBase (hsl) {
		return okhslToOklab(hsl, toSRGBLinear, RGBCoeff);
	},

	formats: {
		color: {
			id: "--okhsl",
			coords: ["<number> | <angle>", "<percentage> | <number>", "<percentage> | <number>"],
		},
	},
});
