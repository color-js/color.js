// Okhsv class.
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
import {spow, multiply_v3_m3x3} from "../util.js";
import {constrain} from "../angles.js";
import {
	tau,
	toe,
	toeInv,
	findCusp,
	toSt,
	oklabToLinearRGB,
	toSRGBLinear,
	RGBCoeff,
} from "./okhsl.js";

// Type "imports"
/** @typedef {import("../types.js").Matrix3x3} Matrix3x3 */
/** @typedef {import("../types.js").Vector3} Vector3 */
/** @typedef {import("../types.js").Coords} Coords */
/** @typedef {import("../types.js").OKCoeff} OKCoeff */


/**
 *
 * @param {Vector3} hsv
 * @param {Matrix3x3} lmsToRgb
 * @param {OKCoeff} okCoeff
 * @returns {Coords}
 */
function okhsvToOklab (hsv, lmsToRgb, okCoeff) {
	// Convert from Okhsv to Oklab."""

	let [h, s, v] = hsv;
	h = constrain(h) / 360.0;

	let l = toeInv(v);
	let a = null;
	let b = null;

	// Avoid processing gray or colors with undefined hues
	if (l !== 0.0 && s !== 0.0) {
		let a_ = Math.cos(tau * h);
		let b_ = Math.sin(tau * h);

		let cusp = findCusp(a_, b_, lmsToRgb, okCoeff);
		let [sMax, tMax] = toSt(cusp);
		let s0 = 0.5;
		let k = 1 - s0 / sMax;

		// first we compute L and V as if the gamut is a perfect triangle:

		// L, C when v==1:
		let lv = 1 - s * s0 / (s0 + tMax - tMax * k * s);
		let cv = s * tMax * s0 / (s0 + tMax - tMax * k * s);

		l = v * lv;
		let c = v * cv;

		// then we compensate for both toe and the curved top part of the triangle:
		let lvt = toeInv(lv);
		let cvt = cv * lvt / lv;

		let lNew = toeInv(l);
		c = c * lNew / l;
		l = lNew;

		// RGB scale
		let [rs, gs, bs] = oklabToLinearRGB([lvt, a_ * cvt, b_ * cvt], lmsToRgb);
		let scaleL = spow(1.0 / Math.max(Math.max(rs, gs), Math.max(bs, 0.0)), 1 / 3);

		l = l * scaleL;
		c = c * scaleL;

		a = c * a_;
		b = c * b_;
	}

	return [l, a, b];
}

/**
 *
 * @param {Vector3} lab
 * @param {Matrix3x3} lmsToRgb
 * @param {OKCoeff} okCoeff
 * @returns {Coords}
 */
function oklabToOkhsv (lab, lmsToRgb, okCoeff) {
	// Oklab to Okhsv.

	// Epsilon for saturation just needs to be sufficiently close when denoting achromatic
	let ε = 1e-4;
	let l = lab[0];
	let s = 0.0;
	let v = toe(l);
	let c = Math.sqrt(lab[1] ** 2 + lab[2] ** 2);
	let h = 0.5 + Math.atan2(-lab[2], -lab[1]) / tau;

	if (l !== 0.0 && l !== 1 && c !== 0.0) {
		let a_ = lab[1] / c;
		let b_ = lab[2] / c;

		let cusp = findCusp(a_, b_, lmsToRgb, okCoeff);
		let [sMax, tMax] = toSt(cusp);
		let s0 = 0.5;
		let k = 1 - s0 / sMax;

		// first we find `L_v`, `C_v`, `L_vt` and `C_vt`
		let t = tMax / (c + l * tMax);
		let lv = t * l;
		let cv = t * c;

		let lvt = toeInv(lv);
		let cvt = cv * lvt / lv;

		// we can then use these to invert the step that compensates
		// for the toe and the curved top part of the triangle:
		let [rs, gs, bs] = oklabToLinearRGB([lvt, a_ * cvt, b_ * cvt], lmsToRgb);
		let scaleL = spow(1.0 / Math.max(Math.max(rs, gs), Math.max(bs, 0.0)), 1 / 3);

		l = l / scaleL;
		c = c / scaleL;

		c = c * toe(l) / l;
		l = toe(l);

		// we can now compute v and s:
		v = l / lv;
		s = (s0 + tMax) * cv / ((tMax * s0) + tMax * k * cv);
	}

	if (Math.abs(s) < ε || v === 0.0) {
		h = null;
	}

	else {
		h = constrain(h * 360);
	}

	return [h, s, v];
}


export default new ColorSpace({
	id: "okhsv",
	name: "Okhsv",
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
		v: {
			range: [0, 1],
			name: "Value",
		},
	},

	base: Oklab,
	gamutSpace: "self",

	// Convert Oklab to Okhsl
	fromBase (lab) {
		return oklabToOkhsv(lab, toSRGBLinear, RGBCoeff);
	},

	// Convert Okhsl to Oklab
	toBase (hsl) {
		return okhsvToOklab(hsl, toSRGBLinear, RGBCoeff);
	},

	formats: {
		color: {
			id: "--okhsv",
			coords: ["<number> | <angle>", "<percentage> | <number>", "<percentage> | <number>"],
		},
	},
});
