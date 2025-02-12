/*
Adapted from: https://github.com/hsluv/hsluv-javascript/blob/14b49e6cf9a9137916096b8487a5372626b57ba4/src/hsluv.ts

Copyright (c) 2012-2022 Alexei Boronine

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

import ColorSpace from "../ColorSpace.js";
import LCHuv from "./lchuv.js";
import { fromXYZ_M } from "./srgb-linear.js";
import { skipNone } from "../util.js";
import { calculateBoundingLines } from "./hsluv.js";

const ε = 216 / 24389; // 6^3/29^3 == (24/116)^3
const κ = 24389 / 27; // 29^3/3^3

const m_r0 = fromXYZ_M[0][0];
const m_r1 = fromXYZ_M[0][1];
const m_r2 = fromXYZ_M[0][2];
const m_g0 = fromXYZ_M[1][0];
const m_g1 = fromXYZ_M[1][1];
const m_g2 = fromXYZ_M[1][2];
const m_b0 = fromXYZ_M[2][0];
const m_b1 = fromXYZ_M[2][1];
const m_b2 = fromXYZ_M[2][2];

function distanceFromOrigin (slope, intercept) {
	return Math.abs(intercept) / Math.sqrt(Math.pow(slope, 2) + 1);
}

function calcMaxChromaHpluv (lines) {
	let r0 = distanceFromOrigin(lines.r0s, lines.r0i);
	let r1 = distanceFromOrigin(lines.r1s, lines.r1i);
	let g0 = distanceFromOrigin(lines.g0s, lines.g0i);
	let g1 = distanceFromOrigin(lines.g1s, lines.g1i);
	let b0 = distanceFromOrigin(lines.b0s, lines.b0i);
	let b1 = distanceFromOrigin(lines.b1s, lines.b1i);

	return Math.min(r0, r1, g0, g1, b0, b1);
}

export default new ColorSpace({
	id: "hpluv",
	name: "HPLuv",
	coords: {
		h: {
			refRange: [0, 360],
			type: "angle",
			name: "Hue",
		},
		s: {
			range: [0, 100],
			name: "Saturation",
		},
		l: {
			range: [0, 100],
			name: "Lightness",
		},
	},

	base: LCHuv,
	gamutSpace: "self",

	// Convert LCHuv to HPLuv
	fromBase (lch) {
		let [l, c, h] = [skipNone(lch[0]), skipNone(lch[1]), skipNone(lch[2])];
		let s;

		if (l > 99.9999999) {
			s = 0;
			l = 100;
		}
		else if (l < 0.00000001) {
			s = 0;
			l = 0;
		}
		else {
			let lines = calculateBoundingLines(l);
			let max = calcMaxChromaHpluv(lines);
			s = (c / max) * 100;
		}
		return [h, s, l];
	},

	// Convert HPLuv to LCHuv
	toBase (hsl) {
		let [h, s, l] = [skipNone(hsl[0]), skipNone(hsl[1]), skipNone(hsl[2])];
		let c;

		if (l > 99.9999999) {
			l = 100;
			c = 0;
		}
		else if (l < 0.00000001) {
			l = 0;
			c = 0;
		}
		else {
			let lines = calculateBoundingLines(l);
			let max = calcMaxChromaHpluv(lines);
			c = (max / 100) * s;
		}

		return [l, c, h];
	},

	formats: {
		color: {
			id: "--hpluv",
			coords: ["<number> | <angle>", "<percentage> | <number>", "<percentage> | <number>"],
		},
	},
});
