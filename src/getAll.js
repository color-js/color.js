import ColorSpace from "./ColorSpace.js";
import getColor from "./getColor.js";
import { toPrecision, type } from "./util.js";

/** @typedef {import("./types.js").ColorTypes} ColorTypes */
/** @typedef {import("./types.js").Coords} Coords */

/**
 * Options for {@link getAll}
 * @typedef GetAllOptions
 * @property {string | ColorSpace | undefined} [space]
 * The color space to convert to. Defaults to the color's current space
 * @property {number | undefined} [precision]
 * The number of significant digits to round the coordinates to
 */

/**
 * Get the coordinates of a color in any color space
 * @overload
 * @param {ColorTypes} color
 * @param {string | ColorSpace} [options=color.space] The color space to convert to. Defaults to the color's current space
 * @returns {Coords} The color coordinates in the given color space
 */
/**
 * @overload
 * @param {ColorTypes} color
 * @param {GetAllOptions} [options]
 * @returns {Coords} The color coordinates in the given color space
 */
export default function getAll (color, options) {
	color = getColor(color);

	let optionsType = type(options);
	let space, precision;
	if (optionsType === "string" || options instanceof ColorSpace) {
		space = options;
	}
	else if (optionsType === "object") {
		space = options.space;
		precision = options.precision;
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
