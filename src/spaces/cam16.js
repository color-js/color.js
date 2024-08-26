import ColorSpace from "../ColorSpace.js";
import {multiply_v3_m3x3, interpolate, copySign, spow, zdiv, bisectLeft} from "../util.js";
import {constrain} from "../angles.js";
import xyz_d65 from "./xyz-d65.js";
import {WHITES} from "../adapt.js";

// Type "imports"
/** @typedef {import("../types.js").Coords} Coords */
/** @typedef {import("../types.js").Matrix3x3} Matrix3x3 */
/** @typedef {import("../types.js").Vector3} Vector3 */

const white = WHITES.D65;
const adaptedCoef = 0.42;
const adaptedCoefInv = 1 / adaptedCoef;
const tau = 2 * Math.PI;

/** @type {Matrix3x3} */
const cat16 = [
	[  0.401288,  0.650173, -0.051461 ],
	[ -0.250268,  1.204414,  0.045854 ],
	[ -0.002079,  0.048952,  0.953127 ],
];

/** @type {Matrix3x3} */
const cat16Inv = [
	[1.8620678550872327, -1.0112546305316843, 0.14918677544445175],
	[0.38752654323613717, 0.6214474419314753, -0.008973985167612518],
	[-0.015841498849333856, -0.03412293802851557, 1.0499644368778496],
];

/** @type {Matrix3x3} */
const m1 = [
	[460.0, 451.0, 288.0],
	[460.0, -891.0, -261.0],
	[460.0, -220.0, -6300.0],
];

const surroundMap = {
	dark: [0.8, 0.525, 0.8],
	dim: [0.9, 0.59, 0.9],
	average: [1, 0.69, 1],
};

const hueQuadMap = {
	// Red, Yellow, Green, Blue, Red
	h: [20.14, 90.00, 164.25, 237.53, 380.14],
	e: [0.8, 0.7, 1.0, 1.2, 0.8],
	H: [0.0, 100.0, 200.0, 300.0, 400.0],
};

const rad2deg = 180 / Math.PI;
const deg2rad = Math.PI / 180;

/**
 * @param {Coords} coords
 * @param {number} fl
 * @returns {[number, number, number]}
 */
export function adapt (coords, fl) {
	const temp = /** @type {[number, number, number]} */ (coords.map(c => {
		const x = spow(fl * Math.abs(c) * 0.01, adaptedCoef);
		return 400 * copySign(x, c) / (x + 27.13);
	}));
	return temp;
}

/**
 * @param {Coords} adapted
 * @param {number} fl
 * @returns {[number, number, number]}
 */
export function unadapt (adapted, fl) {
	const constant = 100 / fl * (27.13 ** adaptedCoefInv);
	return /** @type {[number, number, number]} */ (adapted.map(c => {
		const cabs = Math.abs(c);
		return copySign(constant * spow(cabs / (400 - cabs), adaptedCoefInv), c);
	}));
}

/**
 * @param {number} h
 */
export function hueQuadrature (h) {
	let hp = constrain(h);
	if (hp <= hueQuadMap.h[0]) {
		hp += 360;
	}

	const i = bisectLeft(hueQuadMap.h, hp) - 1;
	const [hi, hii] = hueQuadMap.h.slice(i, i + 2);
	const [ei, eii] = hueQuadMap.e.slice(i, i + 2);
	const Hi = hueQuadMap.H[i];

	const t = (hp - hi) / ei;
	return Hi + (100 * t) / (t + (hii - hp) / eii);
}

/**
 * @param {number} H
 */
export function invHueQuadrature (H) {
	let Hp = ((H % 400 + 400) % 400);
	const i = Math.floor(0.01 * Hp);
	Hp = Hp % 100;
	const [hi, hii] = hueQuadMap.h.slice(i, i + 2);
	const [ei, eii] = hueQuadMap.e.slice(i, i + 2);

	return constrain(
		(Hp * (eii * hi - ei * hii) - 100 * hi * eii) /
		(Hp * (eii - ei) - 100 * eii),
	);
}

/**
 * @param {[number, number, number]} refWhite
 * @param {number} adaptingLuminance
 * @param {number} backgroundLuminance
 * @param {keyof typeof surroundMap} surround
 * @param {boolean} discounting
 */
export function environment (
	refWhite,
	adaptingLuminance,
	backgroundLuminance,
	surround,
	discounting,
) {

	const env = {};

	env.discounting = discounting;
	env.refWhite = refWhite;
	env.surround = surround;
	const xyzW = /** @type {Vector3} */ (refWhite.map(c => {
		return c * 100;
	}));

	// The average luminance of the environment in `cd/m^2cd/m` (a.k.a. nits)
	env.la = adaptingLuminance;
	// The relative luminance of the nearby background
	env.yb = backgroundLuminance;
	// Absolute luminance of the reference white.
	const yw = xyzW[1];

	// Cone response for reference white
	const rgbW = multiply_v3_m3x3(xyzW, cat16);

	// Surround: dark, dim, and average
	// @ts-expect-error surround is never used again
	surround = surroundMap[env.surround];
	const f = surround[0];
	env.c = surround[1];
	env.nc = surround[2];

	const k = 1 / (5 * env.la + 1);
	const k4 = k ** 4;

	// Factor of luminance level adaptation
	env.fl = (k4 * env.la + 0.1 * (1 - k4) * (1 - k4) * Math.cbrt(5 * env.la));
	env.flRoot = env.fl ** 0.25;

	env.n = env.yb / yw;
	env.z = 1.48 + Math.sqrt(env.n);
	env.nbb = 0.725 * (env.n ** -0.2);
	env.ncb = env.nbb;

	// Degree of adaptation calculating if not discounting
	// illuminant (assumed eye is fully adapted)
	const d = (discounting) ?
		1 :
		Math.max(
			Math.min(f * (1 - 1 / 3.6 * Math.exp((-env.la - 42) / 92)), 1),
			0,
		);
	env.dRgb = rgbW.map(c => {
		return interpolate(1, yw / c, d);
	});
	env.dRgbInv = env.dRgb.map(c => {
		return 1 / c;
	});

	// Achromatic response
	const rgbCW = /** @type {[number, number, number]} */ (rgbW.map((c, i) => {
		return c * env.dRgb[i];
	}));
	const rgbAW = adapt(rgbCW, env.fl);
	env.aW = env.nbb * (2 * rgbAW[0] + rgbAW[1] + 0.05 * rgbAW[2]);

	// console.log(env);

	return env;
}

// Pre-calculate everything we can with the viewing conditions
const viewingConditions = environment(
	white,
	64 / Math.PI * 0.2, 20,
	"average",
	false,
);

/** @typedef {{J: number, C: number, h: number, s: number, Q: number, M: number, H: number}} Cam16Object */

/**
 * @param {Cam16Object} cam16
 * @param {Record<string, unknown>} env
 * @returns {[number, number, number]}
 * @todo Add types for `env`
 */
export function fromCam16 (cam16, env) {

	// These check ensure one, and only one attribute for a
	// given category is provided.
	if (!((cam16.J !== undefined) ^ (cam16.Q !== undefined))) {
		throw new Error("Conversion requires one and only one: 'J' or 'Q'");
	}

	if (!((cam16.C !== undefined) ^ (cam16.M !== undefined) ^ (cam16.s !== undefined))) {
		throw new Error("Conversion requires one and only one: 'C', 'M' or 's'");
	}

	// Hue is absolutely required
	if (!((cam16.h !== undefined) ^ (cam16.H !== undefined))) {
		throw new Error("Conversion requires one and only one: 'h' or 'H'");
	}

	// Black
	if (cam16.J === 0.0 || cam16.Q === 0.0) {
		return [0.0, 0.0, 0.0];
	}

	// Break hue into Cartesian components
	let hRad = 0.0;
	if (cam16.h !== undefined) {
		hRad = constrain(cam16.h) * deg2rad;
	}
	else {
		hRad = invHueQuadrature(cam16.H) * deg2rad;
	}

	const cosh = Math.cos(hRad);
	const sinh = Math.sin(hRad);

	// Calculate `Jroot` from one of the lightness derived coordinates.
	let Jroot = 0.0;
	if (cam16.J !== undefined) {
		Jroot = spow(cam16.J, 1 / 2) * 0.1;
	}
	else if (cam16.Q !== undefined) {
		Jroot = 0.25 * env.c * cam16.Q / ((env.aW + 4) * env.flRoot);
	}

	// Calculate the `t` value from one of the chroma derived coordinates
	let alpha = 0.0;
	if (cam16.C !== undefined) {
		alpha = cam16.C / Jroot;
	}
	else if (cam16.M !== undefined) {
		alpha = (cam16.M / env.flRoot) / Jroot;
	}
	else if (cam16.s !== undefined) {
		alpha = 0.0004 * (cam16.s ** 2) * (env.aW + 4) / env.c;
	}
	const t = spow(
		alpha * Math.pow(1.64 - Math.pow(0.29, env.n), -0.73),
		10 / 9,
	);

	// Eccentricity
	const et = 0.25 * (Math.cos(hRad + 2) + 3.8);

	// Achromatic response
	const A = env.aW * spow(Jroot, 2 / env.c / env.z);

	// Calculate red-green and yellow-blue components
	const p1 = 5e4 / 13 * env.nc * env.ncb * et;
	const p2 = A / env.nbb;
	const r = (
		23 * (p2 + 0.305) *
		zdiv(t, 23 * p1 + t * (11 * cosh + 108 * sinh))
	);
	const a = r * cosh;
	const b = r * sinh;

	// Calculate back from cone response to XYZ
	const rgb_c = unadapt(
		/** @type {Vector3} */
		(multiply_v3_m3x3([p2, a, b], m1).map(c => {
			return c * 1 / 1403;
		})),
		env.fl,
	);
	return /** @type {Vector3} */ (multiply_v3_m3x3(
		/** @type {Vector3} */(rgb_c.map((c, i) => {
			return c * env.dRgbInv[i];
		})),
		cat16Inv,
	).map(c => {
		return c / 100;
	}));
}

/**
 * @param {[number, number, number]} xyzd65
 * @param {Record<string, unknown>} env
 * @returns {Cam16Object}
 * @todo Add types for `env`
 */
export function toCam16 (xyzd65, env) {
	// Cone response
	const xyz100 = /** @type {Vector3} */ (xyzd65.map(c => {
		return c * 100;
	}));
	const rgbA = adapt(
		/** @type {[number, number, number]} */
		(multiply_v3_m3x3(xyz100, cat16).map((c, i) => {
			return c * env.dRgb[i];
		})),
		env.fl,
	);

	// Calculate hue from red-green and yellow-blue components
	const a = rgbA[0] + (-12 * rgbA[1] + rgbA[2]) / 11;
	const b = (rgbA[0] + rgbA[1] - 2 * rgbA[2]) / 9;
	const hRad = ((Math.atan2(b, a) % tau) + tau) % tau;

	// Eccentricity
	const et = 0.25 * (Math.cos(hRad + 2) + 3.8);

	const t = (
		5e4 / 13 * env.nc * env.ncb *
		zdiv(
			et * Math.sqrt(a ** 2 + b ** 2),
			rgbA[0] + rgbA[1] + 1.05 * rgbA[2] + 0.305,
		)
	);
	const alpha = spow(t, 0.9) * Math.pow(1.64 - Math.pow(0.29, env.n), 0.73);

	// Achromatic response
	const A = env.nbb * (2 * rgbA[0] + rgbA[1] + 0.05 * rgbA[2]);

	const Jroot = spow(A / env.aW, 0.5 * env.c * env.z);

	// Lightness
	const J = 100 * spow(Jroot, 2);

	// Brightness
	const Q = (4 / env.c * Jroot * (env.aW + 4) * env.flRoot);

	// Chroma
	const C = alpha * Jroot;

	// Colorfulness
	const M = C * env.flRoot;

	// Hue
	const h = constrain(hRad * rad2deg);

	// Hue quadrature
	const H = hueQuadrature(h);

	// Saturation
	const s = 50 * spow(env.c * alpha / (env.aW + 4), 1 / 2);

	// console.log({J: J, C: C, h: h, s: s, Q: Q, M: M, H: H});

	return {J: J, C: C, h: h, s: s, Q: Q, M: M, H: H};
}


// Provided as a way to directly evaluate the CAM16 model
// https://observablehq.com/@jrus/cam16: reference implementation
// https://arxiv.org/pdf/1802.06067.pdf: Nico Schlömer
// https://onlinelibrary.wiley.com/doi/pdf/10.1002/col.22324: hue quadrature
// https://www.researchgate.net/publication/318152296_Comprehensive_color_solutions_CAM16_CAT16_and_CAM16-UCS
// Results compared against: https://github.com/colour-science/colour
export default new ColorSpace({
	id: "cam16-jmh",
	cssId: "--cam16-jmh",
	name: "CAM16-JMh",
	coords: {
		j: {
			refRange: [0, 100],
			name: "J",
		},
		m: {
			refRange: [0, 105.0],
			name: "Colorfulness",
		},
		h: {
			refRange: [0, 360],
			type: "angle",
			name: "Hue",
		},
	},

	base: xyz_d65,

	fromBase (xyz) {
		const cam16 = toCam16(xyz, viewingConditions);
		return [cam16.J, cam16.M, cam16.h];
	},
	toBase (cam16) {
		return fromCam16(
			{J: cam16[0], M: cam16[1], h: cam16[2]},
			viewingConditions,
		);
	},
});
