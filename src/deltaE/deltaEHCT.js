import hct from "../spaces/hct.js";
import {viewingConditions} from "../spaces/hct.js";
import getColor from "../getColor.js";

// Type "imports"
/** @typedef {import("../types.js").Coords} Coords */

const rad2deg = 180 / Math.PI;
const deg2rad = Math.PI / 180;
const ucsCoeff = [1.00, 0.007, 0.0228];

/**
* Convert HCT chroma and hue (CAM16 JMh colorfulness and hue) using UCS logic for a and b.
* @param {Coords} coords - HCT coordinates.
* @return {number[]}
*/
function convertUcsAb (coords) {
	// We want the distance between the actual color.
	// If chroma is negative, it will throw off our calculations.
	// Normally, converting back to the base and forward will correct it.
	// If we have a negative chroma after this, then we have a color that
	// cannot resolve to positive chroma.
	if (coords[1] < 0) {
		coords = hct.fromBase(hct.toBase(coords));
	}

	// Only in extreme cases (usually outside the visible spectrum)
	// can the input value for log become negative.
	// Avoid domain error by forcing a zero result via "max" if necessary.
	const M = Math.log(Math.max(1 + ucsCoeff[2] * coords[1] * viewingConditions.flRoot, 1.0)) / ucsCoeff[2];
	const hrad = coords[0] * deg2rad;
	const a = M * Math.cos(hrad);
	const b = M * Math.sin(hrad);

	return [coords[2], a, b];
}


/**
 * Color distance using HCT.
 * @param {import("../types.js").ColorTypes} color
 * @param {import("../types.js").ColorTypes} sample
 * @returns {number}
 */
export default function (color, sample) {
	[color, sample] = getColor([color, sample]);

	let [ t1, a1, b1 ] = convertUcsAb(hct.from(color));
	let [ t2, a2, b2 ] = convertUcsAb(hct.from(sample));

	// Use simple euclidean distance with a and b using UCS conversion
	// and LCh lightness (HCT tone).
	return Math.sqrt((t1 - t2) ** 2 + (a1 - a2) ** 2 + (b1 - b2) ** 2);
}
