import helmlab from "../spaces/helmlab.js";
import getColor from "../getColor.js";

// Helmlab MetricSpace weighted distance (v20b, 72 params).
// Optimized on 64,000+ human color-difference judgments (COMBVD).
// Achieves 20.1% lower STRESS than CIEDE2000.
//
// Formula:
//   SL = 1 + sl * (L_avg - 0.5)²
//   SC = 1 + sc * C_avg
//   raw = (ΔL²/SL² + wC * Δab²/SC²) ^ (p/2)
//   compressed = raw / (1 + c * raw)
//   ΔE = compressed ^ q

const sl = 0.0010089809904916469;
const sc = 0.021678192255028452;
const wC = 1.0458243890301122;
const p = 0.804265429185275;
const compress = 1.5903206798028005;
const q = 1.1;

/**
 * @param {import("../types.js").ColorTypes} color
 * @param {import("../types.js").ColorTypes} sample
 * @returns {number}
 */
export default function (color, sample) {
	[color, sample] = getColor([color, sample]);

	let [L1, a1, b1] = helmlab.from(color);
	let [L2, a2, b2] = helmlab.from(sample);

	let ΔL = L1 - L2;
	let Δa = a1 - a2;
	let Δb = b1 - b2;

	// Pair-dependent weighting
	let Lavg = (L1 + L2) * 0.5;
	let SL = 1 + sl * (Lavg - 0.5) ** 2;

	let C1 = Math.sqrt(a1 ** 2 + b1 ** 2);
	let C2 = Math.sqrt(a2 ** 2 + b2 ** 2);
	let Cavg = (C1 + C2) * 0.5;
	let SC = 1 + sc * Cavg;

	// Weighted Minkowski distance
	let raw = (ΔL ** 2 / SL ** 2 + wC * (Δa ** 2 + Δb ** 2) / SC ** 2) ** (p / 2);

	// Monotonic compression
	let compressed = raw / (1 + compress * raw);

	return compressed ** q;
}
