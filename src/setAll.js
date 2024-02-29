import ColorSpace from "./space.js";
import getColor from "./getColor.js";

export default function setAll (color, space, coords) {
	color = getColor(color);

	space = ColorSpace.get(space);
	color.coords = space.to(color.space, coords);
	return color;
}

setAll.returns = "color";
