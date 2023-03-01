import * as util from "./util.js";
import ColorSpace from "./space.js";
import defaults from "./defaults.js";
import deltaE2000 from "./deltaE/deltaE2000.js";
import inGamut from "./inGamut.js";
import to from "./to.js";
import get from "./get.js";
import set from "./set.js";
import clone from "./clone.js";
import getColor from "./getColor.js";

/**
 * Force coordinates to be in gamut of a certain color space.
 * Mutates the color it is passed.
 * @param {Object} options
 * @param {string} options.method - How to force into gamut.
 *        If "clip", coordinates are just clipped to their reference range.
 *        If in the form [colorSpaceId].[coordName], that coordinate is reduced
 *        until the color is in gamut. Please note that this may produce nonsensical
 *        results for certain coordinates (e.g. hue) or infinite loops if reducing the coordinate never brings the color in gamut.
 * @param {ColorSpace|string} options.space - The space whose gamut we want to map to
 */
export default function toGamut (color, {method = defaults.gamut_mapping, space = color.space} = {}) {
	if (util.isString(arguments[1])) {
		space = arguments[1];
	}

	space = ColorSpace.get(space);

	if (inGamut(color, space, {epsilon: 0})) {
		return getColor(color);
	}

	// 3 spaces:
	// color.space: current color space
	// space: space whose gamut we are mapping to
	// mapSpace: space with the coord we're reducing
	let spaceColor = to(color, space);

	if (method !== "clip" && !inGamut(color, space)) {
		let clipped = toGamut(clone(spaceColor), {method: "clip", space});
		if (deltaE2000(color, clipped) > 2) {
			// Reduce a coordinate of a certain color space until the color is in gamut
			let coordMeta = ColorSpace.resolveCoord(method);
			let mapSpace = coordMeta.space;
			let coordId = coordMeta.id;

			let mappedColor = to(spaceColor, mapSpace);
			let bounds = coordMeta.range || coordMeta.refRange;
			let min = bounds[0];
			let ε = .01; // for deltaE
			let low = min;
			let high = get(mappedColor, coordId);

			while (high - low > ε) {
				let clipped = clone(mappedColor);
				clipped = toGamut(clipped, {space, method: "clip"});
				let deltaE = deltaE2000(mappedColor, clipped);

				if (deltaE - 2 < ε) {
					low = get(mappedColor, coordId);
				}
				else {
					high = get(mappedColor, coordId);
				}

				set(mappedColor, coordId, (low + high) / 2);
			}

			spaceColor = to(mappedColor, space);
		}
		else {
			spaceColor = clipped;
		}
	}

	if (method === "clip" // Dumb coord clipping
		// finish off smarter gamut mapping with clip to get rid of ε, see #17
		|| !inGamut(spaceColor, space, {epsilon: 0})
	) {
		let bounds = Object.values(space.coords).map(c => c.range || []);

		spaceColor.coords = spaceColor.coords.map((c, i) => {
			let [min, max] = bounds[i];

			if (min !== undefined) {
				c = Math.max(min, c);
			}

			if (max !== undefined) {
				c = Math.min(c, max);
			}

			return c;
		});
	}

	if (space !== color.space) {
		spaceColor = to(spaceColor, color.space);
	}

	color.coords = spaceColor.coords;
	return color;
}

toGamut.returns = "color";
