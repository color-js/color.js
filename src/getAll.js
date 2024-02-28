import ColorSpace from "./space.js";
import getColor from "./getColor.js";

/**
 * Get the coordinates of a color in any color space
 * @param {Color} color
 * @param {string | ColorSpace} [space = color.space] The color space to convert to. Defaults to the color's current space
 * @returns {number[]} The color coordinates in the given color space
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
