import ColorSpace from "./ColorSpace.js";
import getColor from "./getColor.js";

/** @import { ColorTypes, Coords, PlainColorObject } from "./types.js" */

/**
 * Set all coordinates of a color at once, in its own color space or another.
 * Modifies the color in place.
 * @overload
 * @param {ColorTypes} color
 * @param {Coords} coords Array of coordinates
 * @param {number} [alpha]
 * @returns {PlainColorObject}
 */
/**
 * @overload
 * @param {ColorTypes} color
 * @param {string | ColorSpace} space The color space of the provided coordinates.
 * @param {Coords} coords Array of coordinates
 * @param {number} [alpha]
 * @returns {PlainColorObject}
 */
export default function setAll (color, space, coords, alpha) {
	color = getColor(color);

	if (Array.isArray(space)) {
		// Space is omitted
		[space, coords, alpha] = [color.space, space, coords];
	}

	space = ColorSpace.get(space); // Make sure we have a ColorSpace object
	color.coords = space === color.space ? coords.slice() : space.to(color.space, coords);

	if (alpha !== undefined) {
		color.alpha = alpha;
	}

	return color;
}

/** @type {"color"} */
setAll.returns = "color";
