import ColorSpace from "./space.js";
import set from "./set.js";

// Type "imports"
/** @typedef {import("./types.js").ColorTypes} ColorTypes */
/** @typedef {import("./types.js").PlainColorObject} PlainColorObject */

/**
 * @param {ColorTypes} color
 * @param {number} amount
 * @returns {PlainColorObject}
 */
export function lighten (color, amount = 0.25) {
	let space = ColorSpace.get("oklch", "lch");
	let lightness = [space, "l"];
	return set(color, lightness, (l) => l * (1 + amount));
}

/**
 * @param {ColorTypes} color
 * @param {number} amount
 * @returns {PlainColorObject}
 */
export function darken (color, amount = 0.25) {
	let space = ColorSpace.get("oklch", "lch");
	let lightness = [space, "l"];
	return set(color, lightness, (l) => l * (1 - amount));
}
