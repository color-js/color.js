import ColorSpace from "./ColorSpace.js";
import getColor from "./getColor.js";

/** @import { ColorTypes } from "./types.js" */

const ε = 0.000075;

/**
 * Check if a color is in gamut of either its own or another color space
 * @param {ColorTypes} color
 * @param {string | ColorSpace} [space]
 * @param {{ epsilon?: number | undefined }} [param2]
 * @returns {boolean}
 */
export default function inGamut (color, space, { epsilon = ε } = {}) {
	color = getColor(color);

	if (!space) {
		space = color.space;
	}

	space = ColorSpace.get(space);
	let coords = color.coords;

	if (space !== color.space) {
		coords = space.from(color);
	}

	return space.inGamut(coords, { epsilon });
}
