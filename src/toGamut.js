import * as util from "./util.js";
import ColorSpace from "./space.js";
import defaults from "./defaults.js";

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
export default function toGamut (color, {method = defaults.gamut_mapping, space = color.space, inPlace} = {}) {
	if (util.isString(arguments[0])) {
		space = arguments[0];
	}

	space = ColorSpace.get(space);

	if (color.inGamut(space, {epsilon: 0})) {
		return color;
	}

	// 3 spaces:
	// color.space: current color space
	// space: space whose gamut we are mapping to
	// mapSpace: space with the coord we're reducing
	let spaceColor = color.to(space);

	if (method !== "clip" && !color.inGamut(space)) {
		let clipped = spaceColor.clone().toGamut({method: "clip", space});
		if (color.deltaE(clipped, {method: "2000"}) > 2) {
			// Reduce a coordinate of a certain color space until the color is in gamut
			let coordMeta = ColorSpace.resolveCoord(method);
			let mapSpace = coordMeta.space;
			let coordId = coordMeta.id;

			let mappedColor = spaceColor.to(mapSpace);
			let bounds = coordMeta.range || coordMeta.refRange;
			let min = bounds[0];
			let ε = .01; // for deltaE
			let low = min;
			let high = mappedColor[coordId];

			while (high - low > ε) {
				let clipped = mappedColor.clone().toGamut({space, method: "clip"});
				let deltaE = mappedColor.deltaE(clipped, {method: "2000"});
				if (deltaE - 2 < ε) {
					low = mappedColor[coordId];
				}
				else {
					high = mappedColor[coordId];
				}

				mappedColor[coordId] = (high + low) / 2;
			}

			spaceColor = mappedColor.to(space);
		}
		else {
			spaceColor = clipped;
		}

	}

	if (method === "clip" // Dumb coord clipping
		// finish off smarter gamut mapping with clip to get rid of ε, see #17
		|| !spaceColor.inGamut(space, {epsilon: 0})
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

	if (space.id !== color.spaceId) {
		spaceColor = spaceColor.to(color.space);
	}

	color.coords = spaceColor.coords;
	return color;
}