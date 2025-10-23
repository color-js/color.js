import ColorSpace from "./ColorSpace.js";
import { isNone } from "./util.js";

/** @import { ColorTypes } from "./types.js" */

/**
 * Euclidean distance of colors in an arbitrary color space
 * @param {ColorTypes} color1
 * @param {ColorTypes} color2
 * @param {string | ColorSpace} space
 * @returns {number}
 */
export default function distance (color1, color2, space = "lab") {
	space = ColorSpace.get(space);

	// Assume getColor() is called on color in space.from()
	let coords1 = space.from(color1);
	let coords2 = space.from(color2);

	return Math.sqrt(
		coords1.reduce((acc, c1, i) => {
			let c2 = coords2[i];
			if (isNone(c1) || isNone(c2)) {
				return acc;
			}

			return acc + (c2 - c1) ** 2;
		}, 0),
	);
}
