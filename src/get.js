import ColorSpace from "./space.js";
import getAll from "./getAll.js";
import getColor from "./getColor.js";

export default function get (color, prop) {
	color = getColor(color);

	let {space, index} = ColorSpace.resolveCoord(prop, color.space);
	let coords = getAll(color, space);
	return coords[index];
}
