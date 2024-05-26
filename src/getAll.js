import ColorSpace from "./space.js";
import getColor from "./getColor.js";

/** @typedef {import("./types.js").ColorTypes} ColorTypes */
/** @typedef {import("./types.js").Coords} Coords */

/**
 * Get the coordinates of a color in any color space
 * @param {ColorTypes} color
 * @param {string | ColorSpace} space The color space to convert to. Defaults to the color's current space
 * @returns {Coords} The color coordinates in the given color space
 */
export default function getAll (color, space) {
	color = getColor(color);

	if (!space || color.space.equals(space)) {
		// No conversion needed
		return color.coords.slice();
	}

	space = ColorSpace.get(space);
	return space.from(color);
}
