import ColorSpace from "./space.js";
import getColor from "./getColor.js";

const ε = .000075;

/**
 * Check if a color is in gamut of either its own or another color space
 * @return {Boolean} Is the color in gamut?
 */
export default function inGamut (color, space, {epsilon = ε} = {}) {
	color = getColor(color);

	if (!space) {
		space = color.space;
	}

	space = ColorSpace.get(space);
	let coords = color.coords;

	if (space !== color.space) {
		coords = space.from(color);
	}

	return space.inGamut(coords, {epsilon});
}
