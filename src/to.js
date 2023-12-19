import getColor from "./getColor.js";
import ColorSpace from "./space.js";
import toGamut from "./toGamut.js";

/**
 * Convert to color space and return a new color
 * @param {Object|string} space - Color space object or id
 * @param {Object} options
 * @param {boolean} options.inGamut - Whether to force resulting color in gamut
 * @returns {Color}
 */
export default function to (color, space, {inGamut} = {}) {
	color = getColor(color);
	space = ColorSpace.get(space);

	let coords = space.from(color);
	let ret = {space, coords, alpha: color.alpha};

	if (inGamut) {
		ret = toGamut(ret, inGamut === true ? undefined : inGamut);
	}

	return ret;
}

to.returns = "color";
