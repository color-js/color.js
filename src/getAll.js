import ColorSpace from "./space.js";

/**
 * Get the coordinates of a color in another color space
 *
 * @param {string | ColorSpace} space
 * @returns {number[]}
 */
export default function getAll (color, space) {
	space = ColorSpace.get(space);
	return space.from(color);
}
