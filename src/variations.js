import ColorSpace from "./ColorSpace.js";
import set from "./set.js";

/** @import { ColorTypes, PlainColorObject, Ref } from "./types.js" */

/**
 * @param {ColorTypes} color
 * @param {number} amount
 * @returns {PlainColorObject}
 */
export function lighten (color, amount = 0.25) {
	let space = ColorSpace.get("oklch", "lch");
	let /** @type {Ref} */ lightness = [space, "l"];
	return set(color, lightness, l => l * (1 + amount));
}

/**
 * @param {ColorTypes} color
 * @param {number} amount
 * @returns {PlainColorObject}
 */
export function darken (color, amount = 0.25) {
	let space = ColorSpace.get("oklch", "lch");
	let /** @type {Ref} */ lightness = [space, "l"];
	return set(color, lightness, l => l * (1 - amount));
}

/** @type {"color"} */
lighten.returns = "color";

/** @type {"color"} */
darken.returns = "color";
