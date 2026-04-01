/**
 * Helmlab GenSpace — generation-optimized color space for interpolation.
 *
 * Pipeline (v0.11.0, depressed cubic + L-gated enrichment):
 *   XYZ → M1 → depcubic(α=0.02) → M2 → L-gated hue enrichment → PW_L → Lab
 *
 * Optimized for perceptually uniform gradients, palette generation,
 * and color-mix. 50-6 vs OKLab in head-to-head benchmarks (61 metrics,
 * 3038 gradient pairs, sRGB/P3/Rec.2020). 360/360/360 cusps, 0 gamut holes.
 *
 * Key properties:
 *   - Depressed cubic: y³ + αy = x, finite derivative at zero
 *   - L-gated hue enrichment: fixes blue→white purple shift
 *   - Structurally achromatic: a=b≈0 for all grays
 *   - All stages are analytically invertible
 *
 * Reference: arXiv:2602.23010
 * @see https://github.com/Grkmyldz148/helmlab
 */
import ColorSpace from "../ColorSpace.js";
import {multiply_v3_m3x3} from "../util.js";
import XYZ_D65 from "./xyz-d65.js";
import {CAT_TO_HELM, CAT_FROM_HELM} from "./helmlab.js";

/** @import { Matrix3x3 } from "../types.js" */

// ── Depressed cubic parameter ──────────────────────────────────────
const ALPHA = 0.02;
const S = Math.sqrt(ALPHA / 3);
const S3 = S * S * S;

// ── L-gated hue enrichment parameters ──────────────────────────────
const ENR_AMP = 0.055;
const ENR_CENTER = 264.5 * Math.PI / 180; // radians
const ENR_SIGMA = 0.7;
const ENR_LLO = 0.37;
const ENR_LHI = 1.0;

// ── Core matrices (v0.11.0) ────────────────────────────────────────

/** @type {Matrix3x3} */
// prettier-ignore
const M1 = [
	[ 0.8154374735648701,  0.3603221491264266,  -0.12432703417946676],
	[ 0.03298391207546648, 0.9292940788255503,   0.03614494665290377],
	[ 0.048184113668356454, 0.26427748135788043, 0.6336388271114471],
];
/** @type {Matrix3x3} */
// prettier-ignore
const M1_INV = [
	[ 1.2326502723725545, -0.5557414732179251,  0.2735612008453706],
	[-0.040766587876246804, 1.1122097325799587, -0.0714431447037118],
	[-0.07673215022426162, -0.4216188546558442,  1.5871810048801054],
];

/** @type {Matrix3x3} */
// prettier-ignore
const M2 = [
	[ 0.21186668013760682,  0.7989440040850104,  -0.004099375589489282],
	[ 2.4672018828033475,  -2.9877348024830788,   0.520532919679731],
	[-0.11390787868068575,  1.3932982808117473,  -1.279390402131062],
];
/** @type {Matrix3x3} */
// prettier-ignore
const M2_INV = [
	[ 0.9933334327571625,  0.32599327253052285,  0.12945085631713896],
	[ 0.9933334327571625, -0.08708353111074632,  -0.038613617430049534],
	[ 0.9933334327571621, -0.12386097008215027,  -0.8351991365871065],
];

// ── Piecewise-linear L correction (21 breakpoints) ────────────────
// prettier-ignore
const PW_L_IN = [0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5, 0.55, 0.6, 0.65, 0.7, 0.75, 0.8, 0.85, 0.9, 0.95, 1.0];
// prettier-ignore
const PW_L_OUT = [0, 0.009494013522189627, 0.02564569838030986, 0.05525966165868908, 0.10574901531227408, 0.16055853320726027, 0.2140596489299375, 0.2678623050881122, 0.3220435246104499, 0.3739052098520243, 0.43020997780918835, 0.4835465162128873, 0.5399824670411352, 0.5956710081330342, 0.6542161666450477, 0.7115380216519989, 0.7702762412711669, 0.8293313467712836, 0.889406386197059, 0.9462829573474727, 1.0];
const PW_N = PW_L_IN.length;

// ── Depressed cubic: y³ + αy = x ──────────────────────────────────

function depcubicFwd (x) {
	let t = x / (2 * S3);
	let y = 2 * S * Math.sinh(Math.asinh(t) / 3);
	// Halley refinement
	let f = y * y * y + ALPHA * y - x;
	let fp = 3 * y * y + ALPHA;
	let fpp = 6 * y;
	let denom = 2 * fp * fp - f * fpp;
	if (Math.abs(denom) > 1e-30) {
		y -= 2 * f * fp / denom;
	}
	return y;
}

function depcubicInv (y) {
	return y * y * y + ALPHA * y;
}

// ── L-gated hue enrichment ─────────────────────────────────────────

function enrichGate (L) {
	let t = Math.max(0, Math.min(1, (L - ENR_LLO) / (ENR_LHI - ENR_LLO)));
	return Math.sin(Math.PI * t) ** 2;
}

function enrichFwd (L, a, b) {
	let C = Math.sqrt(a * a + b * b);
	if (C < 1e-12) {
		return [a, b];
	}
	let gate = enrichGate(L);
	if (gate < 1e-12) {
		return [a, b];
	}
	let h = Math.atan2(b, a);
	let dh = h - ENR_CENTER;
	dh = dh - Math.round(dh / (2 * Math.PI)) * 2 * Math.PI;
	let gauss = Math.exp(-0.5 * (dh / ENR_SIGMA) ** 2);
	let hNew = h + ENR_AMP * gate * gauss;
	return [C * Math.cos(hNew), C * Math.sin(hNew)];
}

function enrichInv (L, a, b) {
	let C = Math.sqrt(a * a + b * b);
	if (C < 1e-12) {
		return [a, b];
	}
	let gate = enrichGate(L);
	if (gate < 1e-12) {
		return [a, b];
	}
	let hTarget = Math.atan2(b, a);
	let sig2 = ENR_SIGMA * ENR_SIGMA;
	let ag = ENR_AMP * gate;
	let h = hTarget;
	for (let i = 0; i < 8; i++) {
		let dh = h - ENR_CENTER;
		dh = dh - Math.round(dh / (2 * Math.PI)) * 2 * Math.PI;
		let gauss = Math.exp(-0.5 * dh * dh / sig2);
		let F = h + ag * gauss - hTarget;
		let Fp = 1 + ag * gauss * (-dh / sig2);
		let Fpp = ag * gauss * (-1 / sig2 + dh * dh / (sig2 * sig2));
		let den = 2 * Fp * Fp - F * Fpp;
		if (Math.abs(den) > 1e-30) {
			h -= 2 * F * Fp / den;
		}
	}
	return [C * Math.cos(h), C * Math.sin(h)];
}

// ── PW L correction ───────────────────────────────────────────────

function pwLForward (L) {
	if (L <= 0 || L >= 1) {
		return L;
	}
	let lo = 0, hi = PW_N - 1;
	while (hi - lo > 1) {
		let mid = (lo + hi) >> 1;
		if (PW_L_IN[mid] <= L) {
			lo = mid;
		}
		else {
			hi = mid;
		}
	}
	let t = (L - PW_L_IN[lo]) / (PW_L_IN[hi] - PW_L_IN[lo]);
	return PW_L_OUT[lo] + t * (PW_L_OUT[hi] - PW_L_OUT[lo]);
}

function pwLInverse (L) {
	if (L <= PW_L_OUT[0] || L >= PW_L_OUT[PW_N - 1]) {
		return L;
	}
	let lo = 0, hi = PW_N - 1;
	while (hi - lo > 1) {
		let mid = (lo + hi) >> 1;
		if (PW_L_OUT[mid] <= L) {
			lo = mid;
		}
		else {
			hi = mid;
		}
	}
	let t = (L - PW_L_OUT[lo]) / (PW_L_OUT[hi] - PW_L_OUT[lo]);
	return PW_L_IN[lo] + t * (PW_L_IN[hi] - PW_L_IN[lo]);
}

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
		let lms = multiply_v3_m3x3(adapted, M1);

		// Stage 2: Depressed cubic transfer (y³ + αy = x)
		let c0 = depcubicFwd(Math.max(lms[0], 0));
		let c1 = depcubicFwd(Math.max(lms[1], 0));
		let c2 = depcubicFwd(Math.max(lms[2], 0));

		// Stage 2.5: Smooth neutral blend (C∞ correction for achromatic precision)
		{
			let mean = (c0 + c1 + c2) / 3;
			let mx = Math.max(c0, c1, c2);
			let mn = Math.min(c0, c1, c2);
			let spread = (mx - mn) / Math.max(Math.abs(mean), 1e-30);
			let w = Math.exp(-(spread / 1e-5) ** 2);
			c0 += w * (mean - c0);
			c1 += w * (mean - c1);
			c2 += w * (mean - c2);
		}

		// Stage 3: LMS_c → Lab (M2)
		let [L, a, b] = multiply_v3_m3x3([c0, c1, c2], M2);

		// Stage 4: Piecewise-linear L correction
		L = pwLForward(L);

		// Stage 5: L-gated hue enrichment
		[a, b] = enrichFwd(L, a, b);

		return [L, a, b];
	},

	toBase (lab) {
		let [L, a, b] = lab;

		// Undo Stage 5: L-gated hue enrichment
		[a, b] = enrichInv(L, a, b);

		// Undo Stage 4: PW L correction
		L = pwLInverse(L);

		// Undo Stage 3: Lab → LMS_c (M2_inv)
		let [lc0, lc1, lc2] = multiply_v3_m3x3([L, a, b], M2_INV);

		// Undo Stage 2.5: Smooth neutral blend
		{
			let mean = (lc0 + lc1 + lc2) / 3;
			let mx = Math.max(lc0, lc1, lc2);
			let mn = Math.min(lc0, lc1, lc2);
			let spread = (mx - mn) / Math.max(Math.abs(mean), 1e-30);
			let w = Math.exp(-(spread / 1e-5) ** 2);
			lc0 += w * (mean - lc0);
			lc1 += w * (mean - lc1);
			lc2 += w * (mean - lc2);
		}

		// Undo Stage 2: Inverse depressed cubic (x = y³ + αy)
		let l0 = depcubicInv(lc0);
		let l1 = depcubicInv(lc1);
		let l2 = depcubicInv(lc2);

		// Undo Stage 1: LMS → XYZ (M1_inv)
		let xyz = multiply_v3_m3x3([l0, l1, l2], M1_INV);

		// Undo Stage 0: Chromatic adaptation (Helmlab D65 → Color.js D65)
		return multiply_v3_m3x3(xyz, CAT_FROM_HELM);
	},
});
