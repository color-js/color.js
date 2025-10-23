import getColor from "./getColor.js";
import ColorSpace from "./ColorSpace.js";
import toGamut from "./toGamut.js";

/** @import { ColorTypes, PlainColorObject, ToGamutOptions } from "./types.js" */

/**
 * Convert to color space and return a new color
 * @param {ColorTypes} color
 * @param {string | ColorSpace} space
 * @param {{ inGamut?: boolean | ToGamutOptions | undefined }} options
 * @returns {PlainColorObject}
 */
export default function to (color, space, { inGamut } = {}) {
	color = getColor(color);
	space = ColorSpace.get(space);

	let coords = space.from(color);
	let ret = { space, coords, alpha: color.alpha };

	if (inGamut) {
		ret = toGamut(ret, inGamut === true ? undefined : inGamut);
	}

	return ret;
}

/** @type {"color"} */
to.returns = "color";
