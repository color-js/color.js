// Type "imports"
/** @typedef {import("./color.js").default} Color */
/** @typedef {import("./types.js").PlainColorObject} PlainColorObject */

/**
 *
 * @param {Color | PlainColorObject} color
 * @returns {PlainColorObject}
 */
export default function clone (color) {
	return {
		space: color.space,
		coords: /** @type {[number, number, number]} */ (color.coords.slice()),
		alpha: color.alpha,
	};
}
