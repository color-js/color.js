// Type "imports"
/** @typedef {import("./color.js").default} Color */
/** @typedef {import("./types.js").Coords} Coords */
/** @typedef {import("./types.js").PlainColorObject} PlainColorObject */

/**
 * @param {PlainColorObject} color
 * @returns {PlainColorObject}
 */
export default function clone (color) {
	return {
		space: color.space,
		coords: /** @type {Coords} */ (color.coords.slice()),
		alpha: color.alpha,
	};
}
