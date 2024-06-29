// Type "imports"
/** @typedef {import("./types.js").PlainColorObject} PlainColorObject */

/**
 *
 * @param {PlainColorObject} color
 * @returns {PlainColorObject}
 */
export default function clone (color) {
	return {
		space: color.space,
		coords: /** @type {[number, number, number]} */ (color.coords.slice()),
		alpha: color.alpha,
	};
}
