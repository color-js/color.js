/** @import { Coords, PlainColorObject } from "./types.js" */

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
