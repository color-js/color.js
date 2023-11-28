import * as util from "./util.js";
import ColorSpace from "./space.js";
import defaults from "./defaults.js";
import deltaE2000 from "./deltaE/deltaE2000.js";
import deltaEOK from "./deltaE/deltaEOK.js";
import inGamut from "./inGamut.js";
import to from "./to.js";
import get from "./get.js";
import set from "./set.js";
import clone from "./clone.js";
import getColor from "./getColor.js";

/**
 * Force coordinates to be in gamut of a certain color space.
 * Mutates the color it is passed.
 * @param {Object|string} options object or spaceId string
 * @param {string} options.method - How to force into gamut.
 *        If "clip", coordinates are just clipped to their reference range.
 *        If "css", coordinates are reduced according to the CSS 4 Gamut Mapping Algorithm.
 *        If in the form [colorSpaceId].[coordName], that coordinate is reduced
 *        until the color is in gamut. Please note that this may produce nonsensical
 *        results for certain coordinates (e.g. hue) or infinite loops if reducing the coordinate never brings the color in gamut.
 * @param {ColorSpace|string} options.space - The space whose gamut we want to map to
 */

export default function toGamut (color, { method = defaults.gamut_mapping, space = color.space } = {}) {
	if (util.isString(arguments[1])) {
		space = arguments[1];
	}

	space = ColorSpace.get(space);

	// 3 spaces:
	// color.space: current color space
	// space: space whose gamut we are mapping to
	// mapSpace: space with the coord we're reducing

	let spaceColor = to(color, space);
	if (method === "css") {
		spaceColor = to(toGamutCSS(color, { space }), color.space);
	}
	else {
		if (inGamut(color, space, { epsilon: 0 })) {
			return getColor(color);
		}

		if (method !== "clip" && !inGamut(color, space)) {
			let clipped = toGamut(clone(spaceColor), { method: "clip", space });
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
					clipped = toGamut(clipped, { space, method: "clip" });
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
			|| !inGamut(spaceColor, space, { epsilon: 0 })
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
	}

	if (space !== color.space) {
		spaceColor = to(spaceColor, color.space);
	}

	color.coords = spaceColor.coords;
	return color;
}

toGamut.returns = "color";

// The reference colors to be used if lightness is out of the range 0-1 in the
// `Oklch` space. These are created in the `Oklab` space, as it is used by the
// DeltaEOK calculation, so it is guaranteed to be imported.
const COLORS = {
	WHITE: { space: "oklab", coords: [1, 0, 0] },
	BLACK: { space: "oklab", coords: [0, 0, 0] }
};

/**
 * Given a color `origin`, returns a new color that is in gamut using
 * the CSS Gamut Mapping Algorithm. If `space` is specified, it will be in gamut
 * in `space`, and returned in `space`. Otherwise, it will be in gamut and
 * returned in the color space of `origin`.
 * @param {Object} origin
 * @param {Object} options
 * @param {ColorSpace|string} options.space
 * @returns {Color}
 */
export function toGamutCSS (origin, { space = origin.space }) {
	const JND = 0.02;
	const ε = 0.0001;
	space = ColorSpace.get(space);

	if (space.isUnbounded) {
		return to(origin, space);
	}

	const origin_OKLCH = to(origin, ColorSpace.get("oklch"));
	let L = origin_OKLCH.coords[0];

	// return media white or black, if lightness is out of range
	if (L >= 1) {
		const white = to(COLORS.WHITE, space);
		white.alpha = origin.alpha;
		return to(white, space);
	}
	if (L <= 0) {
		const black = to(COLORS.BLACK, space);
		black.alpha = origin.alpha;
		return to(black, space);
	}

	if (inGamut(origin_OKLCH, space)) {
		return to(origin_OKLCH, space);
	}

	function clip (_color) {
		const destColor = to(_color, space);
		const spaceCoords = Object.values(space.coords);
		destColor.coords = destColor.coords.map((coord, index) => {
			const spaceCoord = spaceCoords[index];
			if (("range" in spaceCoord)) {
				if (coord < spaceCoord.range[0]) {
					return spaceCoord.range[0];
				}
				if (coord > spaceCoord.range[1]) {
					return spaceCoord.range[1];
				}
			}
			return coord;
		});
		return destColor;
	}
	let min = 0;
	let max = origin_OKLCH.coords[1];

	let min_inGamut = true;
	let current;

	while ((max - min) > ε) {
		const chroma = (min + max) / 2;
		current = clone(origin_OKLCH);
		current.coords[1] = chroma;
		if (min_inGamut && inGamut(current, space)) {
			min = chroma;
			continue;
		}
		else if (!inGamut(current, space)) {
			const clipped = clip(current);
			const E = deltaEOK(clipped, current);
			if (E < JND) {
				if ((JND - E < ε)) {
					// match found
					current = clipped;
					break;
				}
				else {
					min_inGamut = false;
					min = chroma;
				}
			}
			else {
				max = chroma;
				continue;
			}
		}
	}
	return to(current, space);
}
