import ColorSpace from "./ColorSpace.js";
import getColor from "./getColor.js";
import get from "./get.js";
import getAll from "./getAll.js";
import setAll from "./setAll.js";
import {type} from "./util.js";

// Type "imports"
/** @typedef {import("./types.js").ColorTypes} ColorTypes */
/** @typedef {import("./types.js").PlainColorObject} PlainColorObject */
/** @typedef {import("./types.js").Ref} Ref */

/**
 * Set properties and return current instance
 * @overload
 * @param {ColorTypes} color
 * @param {Ref} prop
 * @param {number | ((coord: number) => number)} value
 * @returns {PlainColorObject}
 */
/**
 * @overload
 * @param {ColorTypes} color
 * @param {Record<string, number | ((coord: number) => number)>} props
 * @returns {PlainColorObject}
 */
export default function set (color, prop, value) {
	color = getColor(color);

	if (arguments.length === 2 && type(arguments[1]) === "object") {
		// Argument is an object literal
		let object = arguments[1];
		for (let p in object) {
			set(color, p, object[p]);
		}
	}
	else {
		if (typeof value === "function") {
			value = value(get(color, prop));
		}

		if (prop === "alpha") {
			color.alpha = value;
		}
		else {
			let {space, index} = ColorSpace.resolveCoord(prop, color.space);
			let coords = getAll(color, space);
			coords[index] = value;
			setAll(color, space, coords);
		}
	}

	return color;
}

/** @type {"color"} */
set.returns = "color";
