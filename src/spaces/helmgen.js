/**
 * Helmlab GenSpace — generation-optimized color space for interpolation.
 *
 * Pipeline (v0.10.0, softened cube root):
 *   XYZ → M1 → softcbrt → M2 → hue_corr → PW_L_corr → Lab
 *
 * Optimized for perceptually uniform gradients, palette generation,
 * and color-mix. 27-7 vs OKLab in head-to-head benchmarks with
 * 360/360/360 cusps (sRGB, P3, Rec.2020).
 *
 * Key properties:
 *   - Softened cube root: f(x) = (x+ε)^(1/3) - ε^(1/3), finite derivative at zero
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

// ── Softened cube root parameters ──────────────────────────────────
const EPS = 0.001;
const EPS_CBRT = 0.1; // 0.001^(1/3)

// ── Core matrices (v0.10.0, 27-7 vs OKLab) ────────────────────────

/** @type {Matrix3x3} */
// prettier-ignore
const M1 = [
	[ 0.8241829891252608,  0.36440843554326735, -0.13571415300566114],
	[ 0.03286046182049214, 0.9293630169582751,   0.036189395860879804],
	[ 0.04813370946146968, 0.26424253789465524,  0.6337149190172036],
];
/** @type {Matrix3x3} */
// prettier-ignore
const M1_INV = [
	[ 1.2185826248050706, -0.5611239455305301,  0.2930113207254598],
	[-0.0401341808079284,  1.1122459188053382, -0.0721117379974099],
	[-0.0758223339584151, -0.4211573680417168,  1.5858097020001316],
];

/** @type {Matrix3x3} */
// prettier-ignore
const M2 = [
	[ 0.2337515171705931,   0.8814711825753971,  -0.004522821912689824],
	[ 1.867570288000307,   -2.014406466522118,    0.14683617852181108],
	[-0.6521735079641363,   1.5661922948078826,  -0.9140187868437465],
];
/** @type {Matrix3x3} */
// prettier-ignore
const M2_INV = [
	[ 0.9003332222839096,  0.4462449303682084,  0.0672336874450225],
	[ 0.9003332222839096, -0.1210346282699026, -0.0238991905033601],
	[ 0.9003332222839093, -0.5258016911340165, -1.1829940186970576],
];

// ── Hue correction: δ(h) = 0.1·sin(2h) ───────────────────────────
const HUE_SIN2 = 0.1;

// ── Piecewise-linear L correction (21 breakpoints) ────────────────
// prettier-ignore
const PW_L_IN = [0, 0.05, 0.10, 0.15, 0.20, 0.25, 0.30, 0.35, 0.40, 0.45, 0.50, 0.55, 0.60, 0.65, 0.70, 0.75, 0.80, 0.85, 0.90, 0.95, 1.0];
// prettier-ignore
const PW_L_OUT = [0, 0.04473921057039986, 0.08947842114079972, 0.1342176317111996, 0.1882933918103982, 0.24233573630600849, 0.29535951532005539, 0.34824332614277598, 0.40062896226708544, 0.4530440126389132, 0.50555538471837536, 0.55818787608738174, 0.61116576288373947, 0.6643108808419349, 0.71780269400386465, 0.77144526690428339, 0.82528486381044819, 0.87913596594902788, 0.93299577672652756, 0.98412885262268923, 1.0];
const PW_N = PW_L_IN.length;

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
		let [lms0, lms1, lms2] = multiply_v3_m3x3(adapted, M1);

		// Stage 2: Softened cube root: f(x) = sign(x)·((|x|+ε)^(1/3) - ε^(1/3))
		let c0 = (Math.abs(lms0) + EPS) ** (1 / 3) - EPS_CBRT;
		let c1 = (Math.abs(lms1) + EPS) ** (1 / 3) - EPS_CBRT;
		let c2 = (Math.abs(lms2) + EPS) ** (1 / 3) - EPS_CBRT;
		if (lms0 < 0) {
			c0 = -c0;
		}
		if (lms1 < 0) {
			c1 = -c1;
		}
		if (lms2 < 0) {
			c2 = -c2;
		}

		// Stage 3: LMS_c → Lab (M2)
		let [L, a, b] = multiply_v3_m3x3([c0, c1, c2], M2);

		// Stage 3.5: Hue correction: δ(h) = 0.1·sin(2h)
		let C = Math.sqrt(a * a + b * b);
		if (C > 1e-10) {
			let h = Math.atan2(b, a);
			let hNew = h + HUE_SIN2 * Math.sin(2 * h);
			a = C * Math.cos(hNew);
			b = C * Math.sin(hNew);
		}

		// Stage 4: Piecewise-linear L correction
		L = pwLForward(L);

		return [L, a, b];
	},

	toBase (lab) {
		let [L, a, b] = lab;

		// Undo Stage 4: PW L correction
		L = pwLInverse(L);

		// Undo Stage 3.5: Hue correction (Newton iteration)
		let C = Math.sqrt(a * a + b * b);
		if (C > 1e-10) {
			let hOut = Math.atan2(b, a);
			let hRaw = hOut;
			for (let i = 0; i < 8; i++) {
				let f = hRaw + HUE_SIN2 * Math.sin(2 * hRaw) - hOut;
				let fp = 1 + 2 * HUE_SIN2 * Math.cos(2 * hRaw);
				if (Math.abs(fp) < 1e-10) {
					fp = 1;
				}
				hRaw -= f / fp;
			}
			a = C * Math.cos(hRaw);
			b = C * Math.sin(hRaw);
		}

		// Undo Stage 3: Lab → LMS_c (M2_inv)
		let [lc0, lc1, lc2] = multiply_v3_m3x3([L, a, b], M2_INV);

		// Undo Stage 2: Inverse softened cube root: sign(y)·((|y|+ε^(1/3))³ - ε)
		let l0 = (Math.abs(lc0) + EPS_CBRT) ** 3 - EPS;
		let l1 = (Math.abs(lc1) + EPS_CBRT) ** 3 - EPS;
		let l2 = (Math.abs(lc2) + EPS_CBRT) ** 3 - EPS;
		if (lc0 < 0) {
			l0 = -l0;
		}
		if (lc1 < 0) {
			l1 = -l1;
		}
		if (lc2 < 0) {
			l2 = -l2;
		}

		// Undo Stage 1: LMS → XYZ (M1_inv)
		let xyz = multiply_v3_m3x3([l0, l1, l2], M1_INV);

		// Undo Stage 0: Chromatic adaptation (Helmlab D65 → Color.js D65)
		return multiply_v3_m3x3(xyz, CAT_FROM_HELM);
	},
});
