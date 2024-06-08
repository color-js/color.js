import getColor from "./getColor.js";

// Type "imports"
/** @typedef {import("./types.js").ColorTypes} ColorTypes */

/**
 * @param {ColorTypes} color1
 * @param {ColorTypes} color2
 * @returns {boolean}
 */
export default function equals (color1, color2) {
	color1 = getColor(color1);
	color2 = getColor(color2);

	return color1.space === color2.space
	       && color1.alpha === color2.alpha
	       && color1.coords.every((c, i) => c === color2.coords[i]);
}
