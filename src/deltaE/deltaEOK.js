import oklab from "../spaces/oklab.js";
import getColor from "../getColor.js";

/**
 * More accurate color-difference formulae
 * than the simple 1976 Euclidean distance in CIE Lab
 * @param {import("../types.js").ColorTypes} color
 * @param {import("../types.js").ColorTypes} sample
 * @returns {number}
 */
export default function (color, sample) {
	[color, sample] = getColor([color, sample]);

	// Given this color as the reference
	// and a sample,
	// calculate deltaEOK, term by term as root sum of squares
	let [L1, a1, b1] = oklab.from(color);
	let [L2, a2, b2] = oklab.from(sample);
	let ΔL = L1 - L2;
	let Δa = a1 - a2;
	let Δb = b1 - b2;
	return Math.sqrt(ΔL ** 2 + Δa ** 2 + Δb ** 2);
}
