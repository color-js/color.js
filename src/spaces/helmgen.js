/**
 * Helmlab GenSpace — generation-optimized color space for interpolation.
 *
 * A simplified pipeline (XYZ → M1 → cbrt → M2 → NC) optimized for
 * perceptually uniform gradients, palette generation, and color-mix.
 * Achieves 6× better hue accuracy than OKLab with 10% better perceptual
 * distance prediction.
 *
 * Key differences from Helmlab (MetricSpace):
 *   - Shared gamma = 1/3 (cube root, guarantees achromatic a=b=0)
 *   - No enrichment stages (simpler, faster, better for generation)
 *   - Different M1/M2 matrices (Phase1H-optimized)
 *
 * Reference: arXiv:2602.23010
 * @see https://github.com/Grkmyldz148/helmlab
 */
import ColorSpace from "../ColorSpace.js";
import {multiply_v3_m3x3} from "../util.js";
import XYZ_D65 from "./xyz-d65.js";

const {cbrt} = Math;

// ── Utility ────────────────────────────────────────────────────────

function signedCbrt (x) {
	return x >= 0 ? cbrt(x) : -cbrt(-x);
}

// ── Core parameters (Phase1H-optimized) ────────────────────────────

// prettier-ignore
const M1 = [
	[ 0.4407412072890238,  0.40911369156796634, 0.18687249931895067],
	[ 0.12308224353121994, 0.557136239636739,   0.19274910862205916],
	[-0.23021079382916068, 0.9278243045135821,  0.4854100909928004],
];
// prettier-ignore
const M1_INV = [
	[ 2.1260672085906416,  -0.5849574469885626, -0.5862125072812664],
	[-2.4165617158029034,   5.963989838684832,  -1.4378868725604872],
	[ 5.627382627163578,  -11.677133103760323,   4.530507259029064],
];

// prettier-ignore
const M2 = [
	[ 0.2778609560084774,   0.21180362605092856,  0.6372017137356791],
	[ 1.7548720474157444,  -0.9793270531556616,  -0.7760752041286899],
	[-2.418690735750103,    3.982044105359993,   -1.2833774660668076],
];
// prettier-ignore
const M2_INV = [
	[0.8649568923272442,   0.5589393137919957,  0.0914563915567646],
	[0.8215892255459024,   0.23569640212826565, 0.26539341551193846],
	[0.9190914921797732,  -0.3220781744225231, -0.12809671783208074],
];

const D65_X = 0.95047, D65_Z = 1.08883;

// ── Neutral correction LUT (lazily computed) ───────────────────────

let ncL = null, ncA = null, ncB = null;

/** Run pipeline without NC on D65 neutrals to measure achromatic error. */
function buildNcLut () {
	let N = 256;
	ncL = new Float64Array(N);
	ncA = new Float64Array(N);
	ncB = new Float64Array(N);

	for (let i = 0; i < N; i++) {
		let Y = i / (N - 1);
		let xyz = [Y * D65_X, Y, Y * D65_Z];

		// Pipeline without NC: M1 → cbrt → M2
		let [lms0, lms1, lms2] = multiply_v3_m3x3(xyz, M1);

		let c0 = signedCbrt(lms0);
		let c1 = signedCbrt(lms1);
		let c2 = signedCbrt(lms2);

		[ncL[i], ncA[i], ncB[i]] = multiply_v3_m3x3([c0, c1, c2], M2);
	}
}

function neutralError (L) {
	if (!ncL) {
		buildNcLut();
	}
	let N = ncL.length;
	if (L <= 0) {
		return [0, 0];
	}
	if (L < ncL[0]) {
		let t = L / ncL[0];
		return [ncA[0] * t, ncB[0] * t];
	}
	if (L >= ncL[N - 1]) {
		return [ncA[N - 1], ncB[N - 1]];
	}
	let lo = 0, hi = N - 1;
	while (hi - lo > 1) {
		let mid = (lo + hi) >> 1;
		if (ncL[mid] <= L) {
			lo = mid;
		}
		else {
			hi = mid;
		}
	}
	let t = (L - ncL[lo]) / (ncL[lo + 1] - ncL[lo]);
	return [
		ncA[lo] + t * (ncA[lo + 1] - ncA[lo]),
		ncB[lo] + t * (ncB[lo + 1] - ncB[lo]),
	];
}

// ── Color space definition ─────────────────────────────────────────

export default new ColorSpace({
	id: "helmgen",
	name: "HelmGen",
	coords: {
		l: {
			refRange: [0, 1.168],
			name: "Lightness",
		},
		a: {
			refRange: [-0.4, 0.4],
		},
		b: {
			refRange: [-0.4, 0.4],
		},
	},
	white: "D65",
	base: XYZ_D65,

	fromBase (xyz) {
		// Stage 1: XYZ → LMS (M1)
		let [lms0, lms1, lms2] = multiply_v3_m3x3(xyz, M1);

		// Stage 2: Shared cube root compression
		let c0 = signedCbrt(lms0);
		let c1 = signedCbrt(lms1);
		let c2 = signedCbrt(lms2);

		// Stage 3: LMS_c → Lab_raw (M2)
		let [L, a, b] = multiply_v3_m3x3([c0, c1, c2], M2);

		// Stage 10: Neutral correction (LUT)
		let [aErr, bErr] = neutralError(L);
		a -= aErr;
		b -= bErr;

		return [L, a, b];
	},

	toBase (lab) {
		let [L, a, b] = lab;

		// Undo Stage 10: neutral correction
		let [aErr, bErr] = neutralError(L);
		a += aErr;
		b += bErr;

		// Undo Stage 3: Lab → LMS_c (M2_inv)
		let [lc0, lc1, lc2] = multiply_v3_m3x3([L, a, b], M2_INV);

		// Undo Stage 2: cube (inverse of cube root)
		let l0 = lc0 * lc0 * lc0;
		let l1 = lc1 * lc1 * lc1;
		let l2 = lc2 * lc2 * lc2;

		// Undo Stage 1: LMS → XYZ (M1_inv)
		return multiply_v3_m3x3([l0, l1, l2], M1_INV);
	},
});
