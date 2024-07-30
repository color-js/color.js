import getColor from "./getColor.js";
import ColorSpace from "./ColorSpace.js";
import to from "./to.js";
import { adjust } from "./angles.js";
import { isNone } from "./util.js";

// Type "imports"
/** @typedef {import("./types.js").ColorTypes} ColorTypes */

/**
 * Get color differences per-component, on any color space
 * @param {ColorTypes} c1
 * @param {ColorTypes} c2
 * @param {object} options
 * @param {string | ColorSpace} [options.space=c1.space] - The color space to use for the delta calculation. Defaults to the color space of the first color.
 * @param {Parameters<typeof adjust>[0]} [options.hue="shorter"] - How to handle hue differences. Same as hue interpolation option.
 */
export default function deltas (c1, c2, {space, hue = "shorter"} = {}) {
	c1 = getColor(c1);
	space ||= c1.space;
	space = ColorSpace.get(space);
	let spaceCoords = Object.values(space.coords);

	[c1, c2] = [c1, c2].map(c => to(c, space));
	let [coords1, coords2] = [c1, c2].map(c => c.coords);

	let coords = /** @type {[number, number, number]} */ (coords1.map((coord1, i) => {
		let coordMeta = spaceCoords[i];
		let coord2 = coords2[i];

		if (coordMeta.type === "angle") {
			[coord1, coord2] = adjust(hue, [coord1, coord2]);
		}

		return subtractCoords(coord1, coord2);
	}));

	let alpha = subtractCoords(c1.alpha, c2.alpha);

	return { space: c1.space, spaceId: ColorSpace.get(c1.space).id, coords, alpha };
}

function subtractCoords (c1, c2) {
	if (isNone(c1) || isNone(c2)) {
		return c1 === c2 ? null : 0;
	}

	return c1 - c2;
}
