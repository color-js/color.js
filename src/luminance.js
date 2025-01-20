/**
 * Relative luminance
 */
import get from "./get.js";
import set from "./set.js";
import xyz_d65 from "./spaces/xyz-d65.js";

// Type "imports"
/** @typedef {import("./types.js").ColorTypes} ColorTypes */

/**
 *
 * @param {ColorTypes} color
 * @returns {number}
 */
export function getLuminance (color) {
	// Assume getColor() is called on color in get()
	return get(color, [xyz_d65, "y"]);
}

/**
 * @param {ColorTypes} color
 * @param {number | ((coord: number) => number)} value
 */
export function setLuminance (color, value) {
	// Assume getColor() is called on color in set()
	set(color, [xyz_d65, "y"], value);
}

/**
 * @param {typeof import("./color.js").default} Color
 */
export function register (Color) {
	Object.defineProperty(Color.prototype, "luminance", {
		get () {
			return getLuminance(this);
		},
		set (value) {
			setLuminance(this, value);
		},
	});
}
