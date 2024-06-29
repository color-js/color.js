import ColorSpace from "../ColorSpace.js";
import {WHITES} from "../adapt.js";
import xyz_d65 from "./xyz-d65.js";
import {uv} from "../chromaticity.js";
import {isNone, skipNone} from "../util.js";

let white = WHITES.D65;

const ε = 216 / 24389;  // 6^3/29^3 == (24/116)^3
const κ = 24389 / 27;   // 29^3/3^3
const [U_PRIME_WHITE, V_PRIME_WHITE] = uv({space: xyz_d65, coords: white});

export default new ColorSpace({
	id: "luv",
	name: "Luv",
	coords: {
		l: {
			refRange: [0, 100],
			name: "Lightness",
		},
		// Reference ranges from https://facelessuser.github.io/coloraide/colors/luv/
		u: {
			refRange: [-215, 215],
		},
		v: {
			refRange: [-215, 215],
		},
	},

	white: white,
	base: xyz_d65,

	// Convert D65-adapted XYZ to Luv
	// https://en.wikipedia.org/wiki/CIELUV#The_forward_transformation
	fromBase (XYZ) {
		let xyz = /** @type {[number, number, number]} */ ([skipNone(XYZ[0]), skipNone(XYZ[1]), skipNone(XYZ[2])]);
		let y = xyz[1];

		let [up, vp] = uv({space: xyz_d65, coords: xyz});

		// Protect against XYZ of [0, 0, 0]
		if (!Number.isFinite(up) || !Number.isFinite(vp)) {
			return [0, 0, 0];
		}

		let L = y <= ε ? κ * y : 116 * Math.cbrt(y) - 16;
		return [
			L,
			13 * L * (up - U_PRIME_WHITE),
			13 * L * (vp - V_PRIME_WHITE),
		 ];
	},

	// Convert Luv to D65-adapted XYZ
	// https://en.wikipedia.org/wiki/CIELUV#The_reverse_transformation
	toBase (Luv) {
		let [L, u, v] = Luv;

		// Protect against division by zero and none Lightness
		if (L === 0 || isNone(L)) {
			return [0, 0, 0];
		}

		u = skipNone(u);
		v = skipNone(v);

		let up = (u / (13 * L)) + U_PRIME_WHITE;
		let vp = (v / (13 * L)) + V_PRIME_WHITE;

		let y = L <= 8 ? L / κ : Math.pow((L + 16) / 116, 3);

		return [
			y * ((9 * up) / (4 * vp)),
			y,
			y * ((12 - 3 * up - 20 * vp) / (4 * vp)),
		];
	},

	formats: {
		color: {
			id: "--luv",
			coords: ["<number> | <percentage>", "<number> | <percentage>", "<number> | <percentage>"],
		},
	},
});
