import getColor from "./getColor.js";
import ColorSpace from "./space.js";
import to from "./to.js";
import { adjust } from "./angles.js";
import { isNone } from "./util.js";

/**
 * Get color differences per-component, on any color space
 * @param {Color} c1
 * @param {Color} c2
 * @param {object} options
 * @param {string | ColorSpace} [options.space=c1.space] - The color space to use for the delta calculation. Defaults to the color space of the first color.
 * @param {string} [options.hue="shorter"] - How to handle hue differences. Same as hue interpolation option.
 * @returns {number[]} - An array of differences per component.
 * 		If one of the components is none, the difference will be 0.
 * 		If both components are none, the difference will be none.
 */
export default function deltas (c1, c2, {space, hue = "shorter"} = {}) {
	c1 = getColor(c1);
	space ||= c1.space;
	space = ColorSpace.get(space);
	let spaceCoords = Object.values(space.coords);

	[c1, c2] = [c1, c2].map(c => to(c, space));
	let [coords1, coords2] = [c1, c2].map(c => c.coords);

	let coords = coords1.map((coord1, i) => {
		let coordMeta = spaceCoords[i];
		let coord2 = coords2[i];

		if (coordMeta.type === "angle") {
			[coord1, coord2] = adjust(hue, [coord1, coord2]);
		}

		return subtractCoords(coord1, coord2);
	});

	let alpha = subtractCoords(c1.alpha, c2.alpha);

	return { space: c1.space, spaceId: c1.space.id, coords, alpha };
}

function subtractCoords (c1, c2) {
	if (isNone(c1) || isNone(c2)) {
		return c1 === c2 ? null : 0;
	}

	return c1 - c2;
}
