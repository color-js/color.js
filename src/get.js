import ColorSpace from "./space.js";
import getAll from "./getAll.js";

export default function get (color, prop) {
	let {space, index} = ColorSpace.resolveCoord(prop, color.space);
	let coords = getAll(color, space);
	return coords[index];
}
