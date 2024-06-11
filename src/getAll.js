import ColorSpace from "./ColorSpace.js";
import getColor from "./getColor.js";
import { toPrecision } from "./util.js";

/**
 * Get the coordinates of a color in any color space
 * @param {Color} color
 * @param {string | ColorSpace} [space = color.space] The color space to convert to. Defaults to the color's current space
 * @param {number} [precision] The number of significant digits to round the coordinates to
 * @returns {number[]} The color coordinates in the given color space
 */
export default function getAll (color, space, precision) {
	color = getColor(color);

	if (typeof space === "number") {
		precision = space;
		space = color.space;
	}

	let coords;
	if (!space || color.space.equals(space)) {
		// No conversion needed
		coords = color.coords.slice();
	}
	else {
		space = ColorSpace.get(space);
		coords = space.from(color);
	}

	return precision === undefined ? coords : coords.map(coord => toPrecision(coord, precision));
}
