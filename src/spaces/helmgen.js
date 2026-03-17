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
 *   - Lightweight enrichment: hue-dependent L correction (yellow cusp fix)
 *   - Different M1/M2 matrices (v14 CMA-ES optimized)
 *
 * Reference: arXiv:2602.23010
 * @see https://github.com/Grkmyldz148/helmlab
 */
import ColorSpace from "../ColorSpace.js";
import {multiply_v3_m3x3, spow} from "../util.js";
import XYZ_D65 from "./xyz-d65.js";
import {CAT_TO_HELM, CAT_FROM_HELM} from "./helmlab.js";

/** @import { Matrix3x3 } from "../types.js" */

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

// ── Hue-dependent L correction (v31 yellow cusp fix) ──────────────
const HUE_L_AMP = 0.3664;
const HUE_L_CENTER = 1.5374;   // 88.1 deg in radians
const HUE_L_WIDTH = 0.8816;    // 50.5 deg in radians
const HUE_L_KNEE = 0.6821;

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
			refRange: [-0.4, 0.4],
		},
		b: {
			refRange: [-0.4, 0.4],
		},
	},
	white: "D65",
	base: XYZ_D65,

	fromBase (xyz) {
		// Stage 0: Chromatic adaptation (Color.js D65 → Helmlab D65)
		let adapted = multiply_v3_m3x3(xyz, CAT_TO_HELM);

		// Stage 1: XYZ → LMS (M1)
		let [lms0, lms1, lms2] = multiply_v3_m3x3(adapted, M1);

		// Stage 2: Shared cube root compression
		let c0 = spow(lms0, 1 / 3);
		let c1 = spow(lms1, 1 / 3);
		let c2 = spow(lms2, 1 / 3);

		// Stage 3: LMS_c → Lab (M2)
		let [L, a, b] = multiply_v3_m3x3([c0, c1, c2], M2);

		// Stage 3.25: Hue-dependent L correction (yellow cusp fix)
		let C = Math.sqrt(a * a + b * b);
		if (C > 1e-10) {
			let h = Math.atan2(b, a);
			let dh = Math.atan2(Math.sin(h - HUE_L_CENTER), Math.cos(h - HUE_L_CENTER));
			let w = Math.exp(-((dh / HUE_L_WIDTH) ** 2)) * C / (C + 0.01);
			let excess = Math.max(0, L - HUE_L_KNEE);
			L -= HUE_L_AMP * w * excess;
		}

		return [L, a, b];
	},

	toBase (lab) {
		let [L, a, b] = lab;

		// Undo Stage 3.25: Hue-dependent L correction
		let C = Math.sqrt(a * a + b * b);
		if (C > 1e-10) {
			let h = Math.atan2(b, a);
			let dh = Math.atan2(Math.sin(h - HUE_L_CENTER), Math.cos(h - HUE_L_CENTER));
			let w = Math.exp(-((dh / HUE_L_WIDTH) ** 2)) * C / (C + 0.01);
			let aw = Math.min(HUE_L_AMP * w, 0.99);
			let Lcand = (L - aw * HUE_L_KNEE) / (1 - aw);
			if (Lcand > HUE_L_KNEE) L = Lcand;
		}

		// Undo Stage 3: Lab → LMS_c (M2_inv)
		let [lc0, lc1, lc2] = multiply_v3_m3x3([L, a, b], M2_INV);

		// Undo Stage 2: cube (inverse of cube root)
		let l0 = lc0 * lc0 * lc0;
		let l1 = lc1 * lc1 * lc1;
		let l2 = lc2 * lc2 * lc2;

		// Undo Stage 1: LMS → XYZ (M1_inv)
		let xyz = multiply_v3_m3x3([l0, l1, l2], M1_INV);

		// Undo Stage 0: Chromatic adaptation (Helmlab D65 → Color.js D65)
		return multiply_v3_m3x3(xyz, CAT_FROM_HELM);
	},
});
