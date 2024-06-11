import ColorSpace from "./ColorSpace.js";
import getAll from "./getAll.js";
import getColor from "./getColor.js";

// Type "imports"
/** @typedef {import("./types.js").ColorTypes} ColorTypes */
/** @typedef {import("./types.js").Ref} Ref */

/**
 * @param {ColorTypes} color
 * @param {Ref} prop
 * @returns {number}
 */
export default function get (color, prop) {
	color = getColor(color);

	if (prop === "alpha") {
		return color.alpha ?? 1;
	}

	let {space, index} = ColorSpace.resolveCoord(prop, color.space);
	let coords = getAll(color, space);
	return coords[index];
}
