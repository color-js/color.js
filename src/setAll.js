import ColorSpace from "./space.js";

export default function setAll (color, space, coords) {
	space = ColorSpace.get(space);
	color.coords = space.to(color.space, coords);
	return color;
}
