import { fromXYZ } from "../spaces/helmlab.js";
import getColor from "../getColor.js";
import ColorSpace from "../ColorSpace.js";
import XYZ_D65 from "../spaces/xyz-d65.js";

// Helmlab MetricSpace weighted distance (v21, 72 params).
// Optimized on 64,000+ human color-difference judgments (COMBVD).
//
// Formula:
//   SL = 1 + sl * (L_avg - 0.5)²
//   SC = 1 + sc * C_avg
//   raw = (ΔL²/SL² + wC * Δab²/SC²) ^ (p/2)
//   compressed = raw / (1 + c * raw)
//   ΔE = compressed ^ q

const sl = -0.9155125151657894;
const sc = 2.9268353744941558;
const wC = 3.966003089807536;
const p = 1.9737081170404969;
const compress = 52.473130649294724;
const q = 0.47897301074925214;

/**
 * @param {import("../types.js").ColorTypes} color
 * @param {import("../types.js").ColorTypes} sample
 * @returns {number}
 */
export default function (color, sample) {
	[color, sample] = getColor([color, sample]);

	let xyz1 = ColorSpace.get(color.space).to(XYZ_D65, color.coords);
	let xyz2 = ColorSpace.get(sample.space).to(XYZ_D65, sample.coords);

	let [L1, a1, b1] = fromXYZ(xyz1);
	let [L2, a2, b2] = fromXYZ(xyz2);

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
