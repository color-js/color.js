import ColorSpace from "./ColorSpace.js";
import { isString, isInstance } from "./util.js";
import parse from "./parse.js";

/** @import { ColorTypes, ParseOptions as GetColorOptions, PlainColorObject } from "./types.js" */

/**
 * Resolves a color reference (object or string) to a plain color object
 * @overload
 * @param {ColorTypes} color
 * @param {GetColorOptions} [options]
 * @returns {PlainColorObject}
 */
/**
 * @overload
 * @param {ColorTypes[]} color
 * @param {GetColorOptions} [options]
 * @returns {PlainColorObject[]}
 */
export default function getColor (color, options) {
	if (Array.isArray(color)) {
		return color.map(c => getColor(c, options));
	}

	if (!color) {
		throw new TypeError("Empty color reference");
	}

	if (isString(color)) {
		color = parse(color, options);
	}

	// Object fixup
	let space = color.space || color.spaceId;

	if (typeof space === "string") {
		// Convert string id to color space object
		color.space = ColorSpace.get(space);
	}

	if (color.alpha === undefined) {
		color.alpha = 1;
	}

	return color;
}
