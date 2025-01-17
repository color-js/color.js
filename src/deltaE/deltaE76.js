import distance from "../distance.js";
import getColor from "../getColor.js";

/**
 * @param {import("../types.js").ColorTypes} color
 * @param {import("../types.js").ColorTypes} sample
 * @returns {number}
 */
export default function deltaE76 (color, sample) {
	// Assume getColor() is called in the distance function
	return distance(color, sample, "lab");
}
