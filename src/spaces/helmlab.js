/**
 * Helmlab MetricSpace — 13-stage perceptual color space.
 *
 * A data-driven analytical color space fit on COMBVD (3,813 paired human
 * color-difference judgments aggregating BFD-P, Witt 1999, RIT-DuPont, and
 * Leeds). Used internally by `deltaEHelmlab`; not exposed as a CSS color
 * space because its coordinate system (asymmetric ab plane, L > 1 from
 * H-K modeling, achromatic axis offset from origin) is shaped for ΔE
 * accuracy rather than author-facing coordinates.
 *
 * Measured in this branch: ~24% lower STRESS than CIEDE2000 on COMBVD.
 *
 * Pipeline: XYZ → M1 → γ → M2 → hue correction → H-K → cubic L → dark L
 *   → hue-dep chroma scale → chroma power → L-dep chroma scale
 *   → HLC interaction → hue-dep lightness → rotation
 *
 * Reference: arXiv:2602.23010
 * @see https://github.com/Grkmyldz148/helmlab
 */
import {multiply_v3_m3x3, spow, clamp} from "../util.js";

/** @import { Matrix3x3 } from "../types.js" */

const {cos, sin, sqrt, atan2, exp, abs, pow, PI} = Math;

// ── Bradford CAT: Color.js D65 ↔ Helmlab D65 ─────────────────────
// Color.js D65 = [0.3127/0.3290, 1, (1−0.3127−0.3290)/0.3290]
// Helmlab  D65 = [0.95047, 1.0, 1.08883]  (SPD-integrated, ASTM E308)

/** @type {number[]} */
export const HELMLAB_D65 = [0.95047, 1.0, 1.08883];

/** Bradford CAT: Color.js D65 → Helmlab D65 (apply in fromBase before M1) */
/** @type {Matrix3x3} */
// prettier-ignore
export const CAT_TO_HELM = [
	[1.000042977349746, 2.0718877053183e-05, -4.361018085669474e-05],
	[2.6946201090235744e-05, 0.9999906145080147, -1.4898828405401079e-05],
	[-7.941753620756204e-06, 1.2875204405137254e-05, 0.9997859822609763],
];

/** Bradford CAT: Helmlab D65 → Color.js D65 (apply in toBase after M1_INV) */
/** @type {Matrix3x3} */
// prettier-ignore
export const CAT_FROM_HELM = [
	[0.9999570254019492, -2.071874272730964e-05, 4.361733292468361e-05],
	[-2.694517763358666e-05, 1.000009385946497, 1.490098223546482e-05],
	[7.943459292954202e-06, -1.287824596735154e-05, 1.000214063706999],
];

// ── Utility functions ──────────────────────────────────────────────

// ── Core parameters (v21, 72 params) ──────────────────────────────

/** @type {Matrix3x3} */
// prettier-ignore
const M1 = [
	[   0.72129864331134985189,    0.45344826541531813024,   -0.19288975751942616377],
	[  -0.78821186949557897616,    1.79524137675723594043,    0.08761724511817850503],
	[  -0.09177005999121559676,    0.45765588659459255361,    1.29220455139176770842],
];
/** @type {Matrix3x3} */
// prettier-ignore
const M1_INV = [
	[   1.06510729580885898926,   -0.31500440753011210715,    0.18034923817410389302],
	[   0.47211077138377960383,    0.42719957659624552271,    0.04150680489380984689],
	[  -0.09156391926309541407,   -0.17367093631949789834,    0.77197903825582936399],
];

const GAMMA = [0.47229813098762524, 0.5149184096354483, 0.5113233386366979];
const INV_GAMMA = [2.1173067060606283, 1.9420552485353544, 1.9557096741686448];

/** @type {Matrix3x3} */
// prettier-ignore
const M2 = [
	[  -0.26355622180094095963,    0.41683228837031738312,    0.49267631416564028335],
	[   1.88975705087773215851,   -3.12122320342057735232,    1.04216669210603840590],
	[   0.35851086179620561545,    1.76940281937903676202,   -1.41206260676953720967],
];
/** @type {Matrix3x3} */
// prettier-ignore
const M2_INV = [
	[   0.91838978228150214278,    0.52320512370886662623,    0.70658045980908557038],
	[   1.08990905744330257576,    0.07005324849041903723,    0.43197768747870440853],
	[   1.59889572926420897581,    0.22061850068770233468,    0.01250603735522095097],
];

// Enrichment parameters
const hue_cos1 = -0.02833024015436984, hue_sin1 = -0.21131429516166544;
const hue_cos2 = 0.2189784817615645, hue_sin2 = -0.06871898981942523;
const hue_cos3 = 0.005506053349515315, hue_sin3 = -0.0641329861299175;
const hue_cos4 = -0.053592461436994296, hue_sin4 = -0.00954137464208059;

const hk_weight = 0.2676231133101982, hk_power = 0.8934892185255707;
const hk_hue_mod = 0.7173169828841472;
const hk_sin1 = 0.6915224124600773, hk_cos2 = 0.48647127559605596, hk_sin2 = 0.9853124591201782;

const L_corr_p1 = 0.5385456675962418, L_corr_p2 = 0.12508858146241716, L_corr_p3 = 0.6768950256217603;
const Lh_cos1 = -0.4963251525324449, Lh_sin1 = -0.09564696283240552;

const lp_dark = -0.029053748937210654, lp_dark_hcos = 1.3346761652952872, lp_dark_hsin = -0.1698908144723919;

const cs_cos1 = -0.195370576218515, cs_sin1 = 0.5330819227283227;
const cs_cos2 = 0.08863325582067766, cs_sin2 = 0.9365540137751136;
const cs_cos3 = 0.13789738139719568, cs_sin3 = 0.061650260197979936;
const cs_cos4 = 0.0641970862504494, cs_sin4 = -0.027401052793571013;

const cp_cos1 = -0.09900209889026965, cp_sin1 = 0.059635520647228726;
const cp_cos2 = -0.013586499967803128, cp_sin2 = 0.2253393118474472;

const lc1 = -1.5239477450767043, lc2 = -1.751157310240011;

const hlc_cos1 = -0.43576378069144767, hlc_sin1 = 1.060094063845983;
const hlc_cos2 = 0.47931193034584496, hlc_sin2 = -0.2622579649434462;

const hl_cos1 = 0.13610794232685908, hl_sin1 = 0.1168702235362288;
const hl_cos2 = -0.01617739641422492, hl_sin2 = 0.038145638815030566;

// Rigid rotation φ = −28.2°
const PHI = -28.2 * PI / 180;
const ROT_COS = cos(PHI);
const ROT_SIN = sin(PHI);

// ── Pipeline helper functions ──────────────────────────────────────

function hueDelta (h) {
	return hue_cos1 * cos(h) + hue_sin1 * sin(h) +
		hue_cos2 * cos(2 * h) + hue_sin2 * sin(2 * h) +
		hue_cos3 * cos(3 * h) + hue_sin3 * sin(3 * h) +
		hue_cos4 * cos(4 * h) + hue_sin4 * sin(4 * h);
}

function hueDeltaDeriv (h) {
	return -hue_cos1 * sin(h) + hue_sin1 * cos(h) +
		-2 * hue_cos2 * sin(2 * h) + 2 * hue_sin2 * cos(2 * h) +
		-3 * hue_cos3 * sin(3 * h) + 3 * hue_sin3 * cos(3 * h) +
		-4 * hue_cos4 * sin(4 * h) + 4 * hue_sin4 * cos(4 * h);
}

function chromaScaleH (h) {
	let logS = cs_cos1 * cos(h) + cs_sin1 * sin(h) +
		cs_cos2 * cos(2 * h) + cs_sin2 * sin(2 * h) +
		cs_cos3 * cos(3 * h) + cs_sin3 * sin(3 * h) +
		cs_cos4 * cos(4 * h) + cs_sin4 * sin(4 * h);
	return exp(logS);
}

function lChromaScale (L) {
	let dL = L - 0.5;
	return exp(clamp(-30, lc1 * dL + lc2 * dL * dL, 30));
}

function hlcScale (h, L) {
	let hueFactor = hlc_cos1 * cos(h) + hlc_sin1 * sin(h) +
		hlc_cos2 * cos(2 * h) + hlc_sin2 * sin(2 * h);
	return exp(clamp(-30, (L - 0.5) * hueFactor, 30));
}

function hueLightnessScale (h) {
	let logS = hl_cos1 * cos(h) + hl_sin1 * sin(h) +
		hl_cos2 * cos(2 * h) + hl_sin2 * sin(2 * h);
	return exp(logS);
}

function chromaPowerH (h) {
	return 1 + cp_cos1 * cos(h) + cp_sin1 * sin(h) +
		cp_cos2 * cos(2 * h) + cp_sin2 * sin(2 * h);
}

function lCorrectFwd (L, h) {
	let t = L * (1 - L);
	let result = L + L_corr_p1 * t + L_corr_p2 * t * (0.5 - L) + L_corr_p3 * t * t;
	result += t * (Lh_cos1 * cos(h) + Lh_sin1 * sin(h));
	return result;
}

function lCorrectInv (L1, h) {
	let Lh = Lh_cos1 * cos(h) + Lh_sin1 * sin(h);
	let L = L1;
	for (let i = 0; i < 15; i++) {
		let t = L * (1 - L);
		let dt = 1 - 2 * L;
		let f = L + (L_corr_p1 + Lh) * t + L_corr_p2 * t * (0.5 - L) +
			L_corr_p3 * t * t - L1;
		let dfdL = 1 + (L_corr_p1 + Lh) * dt +
			L_corr_p2 * (dt * (0.5 - L) - t) +
			L_corr_p3 * 2 * t * dt;
		if (abs(dfdL) < 1e-10) {
			dfdL = 1;
		}
		L -= f / dfdL;
	}
	return L;
}

function darkLFwd (L, h) {
	let coeff = lp_dark + lp_dark_hcos * cos(h) + lp_dark_hsin * sin(h);
	let oml = L < 1 ? 1 - L : 0; // clamp at L=1: identity for L≥1
	let g = coeff * L * oml * oml;
	return L * exp(clamp(-30, g, 30));
}

function darkLInv (Ln, h) {
	let coeff = lp_dark + lp_dark_hcos * cos(h) + lp_dark_hsin * sin(h);
	let L = Ln;
	for (let i = 0; i < 12; i++) {
		let oml = L < 1 ? 1 - L : 0;
		let g = coeff * L * oml * oml;
		let eg = exp(clamp(-30, g, 30));
		let f = L * eg - Ln;
		let gp = coeff * oml * (1 - 3 * L);
		let fp = eg * (1 + L * gp);
		if (abs(fp) < 1e-10) {
			fp = 1;
		}
		L -= f / fp;
	}
	return L;
}

// ── Internal forward / inverse for deltaEHelmlab ──────────────────
// Helmlab MetricSpace is the perceptual forward space optimized for ΔE accuracy.
// It is intentionally NOT exposed as a CSS color space — its coordinate system is
// shaped to maximize ΔE prediction on visual-difference datasets (COMBVD, MacAdam,
// RIT-DuPont, Witt, Leeds), which produces an asymmetric ab plane and an L axis
// that exceeds 1 for highly chromatic colors (Helmholtz–Kohlrausch effect). For
// CSS-author-facing use, see HelmGen (`helmgen`).

export const fromXYZ = function (xyz) {
		// Stage 0: Chromatic adaptation (Color.js D65 → Helmlab D65)
		let adapted = multiply_v3_m3x3(xyz, CAT_TO_HELM);

		// Stage 1: XYZ → LMS (M1)
		let [lms0, lms1, lms2] = multiply_v3_m3x3(adapted, M1);

		// Stage 2: Power compression (signed)
		let c0 = spow(lms0, GAMMA[0]);
		let c1 = spow(lms1, GAMMA[1]);
		let c2 = spow(lms2, GAMMA[2]);

		// Stage 3: LMS_c → Lab_raw (M2)
		let [L, a, b] = multiply_v3_m3x3([c0, c1, c2], M2);

		// Stage 3.5: Hue correction (4-harmonic Fourier)
		let h = atan2(b, a);
		let C = sqrt(a * a + b * b);
		let delta = hueDelta(h);
		let hNew = h + delta;
		a = C * cos(hNew);
		b = C * sin(hNew);

		// Stage 3.7: Helmholtz-Kohlrausch correction
		let Cr = sqrt(a * a + b * b);
		let hkBoost = hk_weight * pow(Cr, clamp(0.01, hk_power, 10));
		let hr = atan2(b, a);
		let factor = 1 + hk_hue_mod * cos(hr) + hk_sin1 * sin(hr) +
			hk_cos2 * cos(2 * hr) + hk_sin2 * sin(2 * hr);
		L += hkBoost * factor;

		// Stage 4: Cubic L correction (with hue modulation)
		h = atan2(b, a);
		L = lCorrectFwd(L, h);

		// Stage 4.5: Dark L compression
		h = atan2(b, a);
		L = darkLFwd(L, h);

		// Stage 5: Hue-dependent chroma scaling
		h = atan2(b, a);
		let cs = chromaScaleH(h);
		a *= cs;
		b *= cs;

		// Stage 5.5: Nonlinear chroma power
		h = atan2(b, a);
		C = sqrt(a * a + b * b);
		let p = chromaPowerH(h);
		let Cn = C > 0 ? pow(C, p) : 0;
		a = Cn * cos(h);
		b = Cn * sin(h);

		// Stage 6: L-dependent chroma scaling
		let T = lChromaScale(L);
		a *= T;
		b *= T;

		// Stage 6.5: HLC interaction
		h = atan2(b, a);
		let hlcS = hlcScale(h, L);
		a *= hlcS;
		b *= hlcS;

		// Stage 8: Hue-dependent lightness scaling
		h = atan2(b, a);
		L *= hueLightnessScale(h);

		// Stage 11: Rigid rotation (φ = −28.2°)
		let aRot = a * ROT_COS - b * ROT_SIN;
		let bRot = a * ROT_SIN + b * ROT_COS;

		return [L, aRot, bRot];
};

export const toXYZ = function (lab) {
		let [L, a, b] = lab;

		// Undo Stage 11: rotation
		let aUn = a * ROT_COS + b * ROT_SIN;
		let bUn = -a * ROT_SIN + b * ROT_COS;
		a = aUn;
		b = bUn;

		// Undo Stage 8: hue-dep lightness
		let h = atan2(b, a);
		L /= hueLightnessScale(h);

		// Undo Stage 6.5: HLC
		h = atan2(b, a);
		let hlcS = hlcScale(h, L);
		a /= hlcS;
		b /= hlcS;

		// Undo Stage 6: L-dep chroma
		let T = lChromaScale(L);
		a /= T;
		b /= T;

		// Undo Stage 5.5: chroma power
		h = atan2(b, a);
		let C = sqrt(a * a + b * b);
		let p = chromaPowerH(h);
		let Co = C > 0 ? pow(C, 1 / p) : 0;
		a = Co * cos(h);
		b = Co * sin(h);

		// Undo Stage 5: chroma scaling
		h = atan2(b, a);
		let cs = chromaScaleH(h);
		a /= cs;
		b /= cs;

		// Undo Stage 4.5: dark L
		h = atan2(b, a);
		L = darkLInv(L, h);

		// Undo Stage 4: cubic L
		h = atan2(b, a);
		L = lCorrectInv(L, h);

		// Undo Stage 3.7: H-K
		let Cr = sqrt(a * a + b * b);
		let hkBoost = hk_weight * pow(Cr, clamp(0.01, hk_power, 10));
		let hr = atan2(b, a);
		let factor = 1 + hk_hue_mod * cos(hr) + hk_sin1 * sin(hr) +
			hk_cos2 * cos(2 * hr) + hk_sin2 * sin(2 * hr);
		L -= hkBoost * factor;

		// Undo Stage 3.5: hue correction (Newton iteration)
		let hOut = atan2(b, a);
		C = sqrt(a * a + b * b);
		let hRaw = hOut;
		for (let i = 0; i < 8; i++) {
			let f = hRaw + hueDelta(hRaw) - hOut;
			let fp = 1 + hueDeltaDeriv(hRaw);
			if (abs(fp) < 1e-10) {
				fp = 1;
			}
			hRaw -= f / fp;
		}
		a = C * cos(hRaw);
		b = C * sin(hRaw);

		// Undo Stage 3: Lab → LMS_c (M2_inv)
		let [lc0, lc1, lc2] = multiply_v3_m3x3([L, a, b], M2_INV);

		// Undo Stage 2: power compression
		let l0 = spow(lc0, INV_GAMMA[0]);
		let l1 = spow(lc1, INV_GAMMA[1]);
		let l2 = spow(lc2, INV_GAMMA[2]);

		// Undo Stage 1: LMS → XYZ (M1_inv)
		let xyz = multiply_v3_m3x3([l0, l1, l2], M1_INV);

		// Undo Stage 0: Chromatic adaptation (Helmlab D65 → Color.js D65)
		return multiply_v3_m3x3(xyz, CAT_FROM_HELM);
};

export default { from: fromXYZ, to: toXYZ };
