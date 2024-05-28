import getColor from "./getColor.js";
import ColorSpace from "./space.js";
import to from "./to.js";

/**
 * Get color differences per-component, on any color space
 * @param {Color} c1
 * @param {Color} c2
 * @param {object} options
 * @param {string} [options.space=c1.space] - The color space to use for the delta calculation. Defaults to the color space of the first color.
 * @returns {number[]} - An array of differences per component.
 * 		If one of the components is none, the difference will be 0.
 * 		If both components are none, the difference will be none.
 */
export default function deltas (c1, c2, {space} = {}) {
	c1 = getColor(c1);
	space ||= c1.space;

	[c1, c2] = [c1, c2].map(c => to(c, space));
	let [coords1, coords2] = [c1, c2].map(c => c.coords);

	let coords = coords1.map((coord1, i) => {
		let coord2 = coords2[i];

		if (coord1 === null || coord2 === null) {
			// Handle none
			return coord1 === coord2 ? null : 0;
		}

		return coord1 - coord2;
	});

	let alpha = c1.alpha - c2.alpha;

	return { space: c1.space, spaceId: c1.space.id, coords, alpha };
}

