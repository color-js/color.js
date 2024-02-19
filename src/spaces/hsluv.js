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

import ColorSpace from "../space.js";
import LCHuv from "./lchuv.js";
import sRGB from "./srgb.js";
import {fromXYZ_M} from "./srgb-linear.js";
import {skipNone} from "../util.js";

const ε = 216 / 24389;  // 6^3/29^3 == (24/116)^3
const κ = 24389 / 27;   // 29^3/3^3

const m_r0 = fromXYZ_M[0][0];
const m_r1 = fromXYZ_M[0][1];
const m_r2 = fromXYZ_M[0][2];
const m_g0 = fromXYZ_M[1][0];
const m_g1 = fromXYZ_M[1][1];
const m_g2 = fromXYZ_M[1][2];
const m_b0 = fromXYZ_M[2][0];
const m_b1 = fromXYZ_M[2][1];
const m_b2 = fromXYZ_M[2][2];

function distanceFromOriginAngle (slope, intercept, angle) {
	const d = intercept / (Math.sin(angle) - slope * Math.cos(angle));
	return d < 0 ? Infinity : d;
}

export function calculateBoundingLines (l) {
	const sub1 = Math.pow(l + 16, 3) / 1560896;
	const sub2 = sub1 > ε ? sub1 : l / κ;
	const s1r = sub2 * (284517 * m_r0 - 94839 * m_r2);
	const s2r = sub2 * (838422 * m_r2 + 769860 * m_r1 + 731718 * m_r0);
	const s3r = sub2 * (632260 * m_r2 - 126452 * m_r1);
	const s1g = sub2 * (284517 * m_g0 - 94839 * m_g2);
	const s2g = sub2 * (838422 * m_g2 + 769860 * m_g1 + 731718 * m_g0);
	const s3g = sub2 * (632260 * m_g2 - 126452 * m_g1);
	const s1b = sub2 * (284517 * m_b0 - 94839 * m_b2);
	const s2b = sub2 * (838422 * m_b2 + 769860 * m_b1 + 731718 * m_b0);
	const s3b = sub2 * (632260 * m_b2 - 126452 * m_b1);

	return {
		r0s: s1r / s3r,
		r0i: s2r * l / s3r,
		r1s: s1r / (s3r + 126452),
		r1i: (s2r - 769860) * l / (s3r + 126452),
		g0s: s1g / s3g,
		g0i: s2g * l / s3g,
		g1s: s1g / (s3g + 126452),
		g1i: (s2g - 769860) * l / (s3g + 126452),
		b0s: s1b / s3b,
		b0i: s2b * l / s3b,
		b1s: s1b / (s3b + 126452),
		b1i: (s2b - 769860) * l / (s3b + 126452),
	};
}

function calcMaxChromaHsluv (lines, h) {
	const hueRad = h / 360 * Math.PI * 2;
	const r0 = distanceFromOriginAngle(lines.r0s, lines.r0i, hueRad);
	const r1 = distanceFromOriginAngle(lines.r1s, lines.r1i, hueRad);
	const g0 = distanceFromOriginAngle(lines.g0s, lines.g0i, hueRad);
	const g1 = distanceFromOriginAngle(lines.g1s, lines.g1i, hueRad);
	const b0 = distanceFromOriginAngle(lines.b0s, lines.b0i, hueRad);
	const b1 = distanceFromOriginAngle(lines.b1s, lines.b1i, hueRad);

	return Math.min(r0, r1, g0, g1, b0, b1);
}

export default new ColorSpace({
	id: "hsluv",
	name: "HSLuv",
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
	gamutSpace: sRGB,

	// Convert LCHuv to HSLuv
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
			let max = calcMaxChromaHsluv(lines, h);
			s = c / max * 100;
		}

		return [h, s, l];
	},

	// Convert HSLuv to LCHuv
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
			let max = calcMaxChromaHsluv(lines, h);
			c = max / 100 * s;
		}

		return [l, c, h];
	},

	formats: {
		color: {
			id: "--hsluv",
			coords: ["<number> | <angle>", "<percentage> | <number>", "<percentage> | <number>"],
		},
	},
});
