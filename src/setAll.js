import ColorSpace from "./space.js";
import getColor from "./getColor.js";

/**
 * Set all coordinates of a color at once, in its own color space or another.
 * Modifies the color in place.
 * @param {Color} color
 * @param {ColorSpace | string} [space=color.space] The color space of the provided coordinates.
 * @param {Array<number>} coords Array of coordinates
 * @returns {Color}
 */
export default function setAll (color, space, coords) {
	color = getColor(color);

	if (Array.isArray(space)) {
		// Space is omitted
		[space, coords, alpha] = [color.space, space, coords];
	}

	space = ColorSpace.get(space); // Make sure we have a ColorSpace object
	color.coords = space === color.space ? coords.slice() : space.to(color.space, coords);

	return color;
}

setAll.returns = "color";
