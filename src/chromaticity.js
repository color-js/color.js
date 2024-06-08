import xyz_d65 from "./spaces/xyz-d65.js";
import getAll from "./getAll.js";

// Type "imports"
/** @typedef {import("./color.js").default} Color */
/** @typedef {import("./color.js").ColorTypes} ColorTypes */

// Chromaticity coordinates
/**
 * @param {ColorTypes} color
 * @returns {[number, number]}
 */
export function uv (color) {
	// Assumes getAll() calls getColor() on color
	let [X, Y, Z] = getAll(color, xyz_d65);
	let denom = X + 15 * Y + 3 * Z;
	return [4 * X / denom, 9 * Y / denom];
}

/**
 * @param {ColorTypes} color
 * @returns {[number, number]}
 */
export function xy (color) {
	// Assumes getAll() calls getColor() on color
	let [X, Y, Z] = getAll(color, xyz_d65);
	let  sum = X + Y + Z;
	return [X / sum, Y / sum];
}

/**
 * @param {typeof import("./color.js").default} Color
 */
export function register (Color) {
	// no setters, as lightness information is lost
	// when converting color to chromaticity
	Object.defineProperty(Color.prototype, "uv", {
		get () {
			return uv(this);
		},
	});

	Object.defineProperty(Color.prototype, "xy", {
		get () {
			return xy(this);
		},
	});
}
