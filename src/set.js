import ColorSpace from "./space.js";
import getColor from "./getColor.js";
import get from "./get.js";
import getAll from "./getAll.js";
import setAll from "./setAll.js";
import {type} from "./util.js";

// Set properties and return current instance
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

		let {space, index} = ColorSpace.resolveCoord(prop, color.space);
		let coords = getAll(color, space);
		coords[index] = value;
		setAll(color, space, coords);
	}

	return color;
}

set.returns = "color";
