/**
 * Helmlab GenSpace — generation-optimized color space for interpolation.
 *
 * A simplified pipeline (XYZ → M1 → cbrt → M2 → NC) optimized for
 * perceptually uniform gradients, palette generation, and color-mix.
 * Wins 28/43 perceptual benchmarks vs OKLab (6/43), with sky-blue
 * Blue→White gradients (no purple shift).
 *
 * Key differences from Helmlab (MetricSpace):
 *   - Shared gamma = 1/3 (cube root, guarantees achromatic a=b=0)
 *   - No enrichment stages (simpler, faster, better for generation)
 *   - Different M1/M2 matrices (v14 CMA-ES optimized)
 *
 * Reference: arXiv:2602.23010
 * @see https://github.com/Grkmyldz148/helmlab
 */
import ColorSpace from "../ColorSpace.js";
import {multiply_v3_m3x3} from "../util.js";
import XYZ_D65 from "./xyz-d65.js";

/** @import { Matrix3x3 } from "../types.js" */

const {cbrt} = Math;

// ── Utility ────────────────────────────────────────────────────────

function signedCbrt (x) {
	return x >= 0 ? cbrt(x) : -cbrt(-x);
}

// ── Core parameters (v14 CMA-ES optimized, 28/43 benchmark wins) ───

/** @type {Matrix3x3} */
// prettier-ignore
const M1 = [
	[ 0.7583761294836658,  0.38380162590825084, -0.09608055040602373],
	[ 0.12671393631532843, 0.8421628149123207,   0.03434823621506485],
	[ 0.07639223722200054, 0.258943526275451,    0.6139139663787314],
];
/** @type {Matrix3x3} */
// prettier-ignore
const M1_INV = [
	[ 1.4133073795748363, -0.7245661027731647,  0.26172872319832857],
	[-0.20907372745004327, 1.3153903462455019,  -0.10631661879545863],
	[-0.08767910052303854,-0.46465890124976844,  1.641168001772807],
];

/** @type {Matrix3x3} */
// prettier-ignore
const M2 = [
	[ 0.10058070589596230,  1.01558970993941444, -0.11617041583537688],
	[ 2.36157646996164416, -2.44099737506293479,  0.07942090510129070],
	[ 0.04565327074453784,  0.81875488445424471, -0.86440815519878267],
];
/** @type {Matrix3x3} */
// prettier-ignore
const M2_INV = [
	[1.0,                  0.38277363185391838, -0.09922417671418936],
	[1.0,                 -0.03992154082498714, -0.13806096115936267],
	[1.0,                 -0.01759711336018432, -1.29287072060144137],
];

// ── Color space definition ─────────────────────────────────────────

export default new ColorSpace({
	id: "helmgen",
	name: "HelmGen",
	cssId: "--helmgen",
	coords: {
		l: {
			refRange: [0, 1],
			name: "Lightness",
		},
		a: {
			refRange: [-0.27, 0.27],
		},
		b: {
			refRange: [-0.32, 0.32],
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

		// Stage 3: LMS_c → Lab (M2)
		return multiply_v3_m3x3([c0, c1, c2], M2);
	},

	toBase (lab) {
		let [L, a, b] = lab;

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
