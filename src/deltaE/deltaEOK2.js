import oklab from "../spaces/oklab.js";
import getColor from "../getColor.js";

/**
 * More accurate color-difference formulae
 * than the simple 1976 Euclidean distance in CIE Lab
 * The Oklab a and b axes are scaled relative to the L axis, for better uniformity
 * Björn Ottosson said:
 * "I've recently done some tests with color distance datasets as implemented
 * in Colorio and on both the Combvd dataset and the OSA-UCS dataset a
 * scale factor of slightly more than 2 for a and b would give the best results
 * (2.016 works best for Combvd and 2.045 for the OSA-UCS dataset)."
 * @see {@link <https://github.com/w3c/csswg-drafts/issues/6642#issuecomment-945714988>}
 * @param {import("../types.js").ColorTypes} color
 * @param {import("../types.js").ColorTypes} sample
 * @returns {number}
 */
export default function (color, sample) {
	[color, sample] = getColor([color, sample]);

	// Given this color as the reference
	// and a sample,
	// calculate deltaEOK2, term by term as root sum of squares
	let abscale = 2;
	let [L1, a1, b1] = oklab.from(color);
	let [L2, a2, b2] = oklab.from(sample);
	let ΔL = L1 - L2;
	let Δa = abscale * (a1 - a2);
	let Δb = abscale * (b1 - b2);
	return Math.sqrt(ΔL ** 2 + Δa ** 2 + Δb ** 2);
}
