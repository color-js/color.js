import * as util from "./util.js";
import ColorSpace from "./ColorSpace.js";
import defaults from "./defaults.js";
import deltaE2000 from "./deltaE/deltaE2000.js";
import deltaEOK from "./deltaE/deltaEOK.js";
import inGamut from "./inGamut.js";
import to from "./to.js";
import get from "./get.js";
import oklab from "./spaces/oklab.js";
import set from "./set.js";
import clone from "./clone.js";
import getColor from "./getColor.js";
import deltaEMethods from "./deltaE/index.js";
import { WHITES } from "./adapt.js";

/** @import { ColorTypes, PlainColorObject } from "./types.js" */

// Type re-exports
/** @typedef {import("./types.js").ToGamutOptions} ToGamutOptions */

/**
 * Calculate the epsilon to 2 degrees smaller than the specified JND.
 * @param {number} jnd The target "just noticeable difference".
 * @returns {number}
 */
function calcEpsilon (jnd) {
	// Calculate the epsilon to 2 degrees smaller than the specified JND.

	const order = !jnd ? 0 : Math.floor(Math.log10(Math.abs(jnd)));
	// Limit to an arbitrary value to ensure value is never too small and causes infinite loops.
	return Math.max(parseFloat(`1e${order - 2}`), 1e-6);
}

const GMAPPRESET = {
	hct: {
		method: "hct.c",
		jnd: 2,
		deltaEMethod: "hct",
		blackWhiteClamp: {},
	},
	"hct-tonal": {
		method: "hct.c",
		jnd: 0,
		deltaEMethod: "hct",
		blackWhiteClamp: { channel: "hct.t", min: 0, max: 100 },
	},
};

/**
 * Force coordinates to be in gamut of a certain color space.
 * Mutates the color it is passed.
 * @overload
 * @param {ColorTypes} color
 * @param {ToGamutOptions} [options]
 * @returns {PlainColorObject}
 */
/**
 * @overload
 * @param {ColorTypes} color
 * @param {string} [space]
 * @returns {PlainColorObject}
 */
/**
 * @param {ColorTypes} color
 * @param {string & Partial<ToGamutOptions> | ToGamutOptions} [space]
 * @returns {PlainColorObject}
 */
export default function toGamut (
	color,
	{
		method = defaults.gamut_mapping,
		space = undefined,
		deltaEMethod = "",
		jnd = 2,
		blackWhiteClamp = undefined,
	} = {},
) {
	color = getColor(color);

	if (util.isString(arguments[1])) {
		space = arguments[1];
	}
	else if (!space) {
		space = color.space;
	}

	space = ColorSpace.get(space);

	// 3 spaces:
	// color.space: current color space
	// space: space whose gamut we are mapping to
	// mapSpace: space with the coord we're reducing

	if (inGamut(color, space, { epsilon: 0 })) {
		return /** @type {PlainColorObject} */ (color);
	}

	let spaceColor;
	if (method === "css") {
		spaceColor = toGamutCSS(color, { space });
	}
	else {
		if (method !== "clip" && !inGamut(color, space)) {
			if (Object.prototype.hasOwnProperty.call(GMAPPRESET, method)) {
				({ method, jnd, deltaEMethod, blackWhiteClamp } = GMAPPRESET[method]);
			}

			// Get the correct delta E method
			let de = deltaE2000;
			if (deltaEMethod !== "") {
				for (let m in deltaEMethods) {
					if ("deltae" + deltaEMethod.toLowerCase() === m.toLowerCase()) {
						de = deltaEMethods[m];
						break;
					}
				}
			}

			if (jnd === 0) {
				jnd = 1e-16;
			}

			let clipped = toGamut(to(color, space), { method: "clip", space });
			if (de(color, clipped) > jnd) {
				// Clamp to SDR white and black if required
				if (blackWhiteClamp && Object.keys(blackWhiteClamp).length === 3) {
					let channelMeta = ColorSpace.resolveCoord(blackWhiteClamp.channel);
					let channel = get(to(color, channelMeta.space), channelMeta.id);
					if (util.isNone(channel)) {
						channel = 0;
					}
					if (channel >= blackWhiteClamp.max) {
						return to({ space: "xyz-d65", coords: WHITES["D65"] }, color.space);
					}
					else if (channel <= blackWhiteClamp.min) {
						return to({ space: "xyz-d65", coords: [0, 0, 0] }, color.space);
					}
				}

				// Reduce a coordinate of a certain color space until the color is in gamut
				let coordMeta = ColorSpace.resolveCoord(method);
				let mapSpace = coordMeta.space;
				let coordId = coordMeta.id;

				let mappedColor = to(color, mapSpace);
				// If we were already in the mapped color space, we need to resolve undefined channels
				mappedColor.coords.forEach((c, i) => {
					if (util.isNone(c)) {
						mappedColor.coords[i] = 0;
					}
				});
				let bounds = coordMeta.range || coordMeta.refRange;
				let min = bounds[0];
				let ε = calcEpsilon(jnd);
				let low = min;
				let high = get(mappedColor, coordId);

				while (high - low > ε) {
					let clipped = clone(mappedColor);
					clipped = toGamut(clipped, { space, method: "clip" });
					let deltaE = de(mappedColor, clipped);

					if (deltaE - jnd < ε) {
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
		else {
			spaceColor = to(color, space);
		}

		if (
			method === "clip" || // Dumb coord clipping
			// finish off smarter gamut mapping with clip to get rid of ε, see #17
			!inGamut(spaceColor, space, { epsilon: 0 })
		) {
			let bounds = Object.values(space.coords).map(c => c.range || []);

			spaceColor.coords = /** @type {[number, number, number]} */ (
				spaceColor.coords.map((c, i) => {
					let [min, max] = bounds[i];

					if (min !== undefined) {
						c = Math.max(min, c);
					}

					if (max !== undefined) {
						c = Math.min(c, max);
					}

					return c;
				})
			);
		}
	}

	if (space !== color.space) {
		spaceColor = to(spaceColor, color.space);
	}

	color.coords = spaceColor.coords;
	return /** @type {PlainColorObject} */ (color);
}

/** @type {"color"} */
toGamut.returns = "color";

/**
 * The reference colors to be used if lightness is out of the range 0-1 in the
 * `Oklch` space. These are created in the `Oklab` space, as it is used by the
 * DeltaEOK calculation, so it is guaranteed to be imported.
 * @satisfies {Record<string, ColorTypes>}
 */
const COLORS = {
	WHITE: { space: oklab, coords: [1, 0, 0], alpha: 1 },
	BLACK: { space: oklab, coords: [0, 0, 0], alpha: 1 },
};

/**
 * Given a color `origin`, returns a new color that is in gamut using
 * the CSS Gamut Mapping Algorithm. If `space` is specified, it will be in gamut
 * in `space`, and returned in `space`. Otherwise, it will be in gamut and
 * returned in the color space of `origin`.
 * @param {ColorTypes} origin
 * @param {{ space?: string | ColorSpace | undefined }} param1
 * @returns {PlainColorObject}
 */
export function toGamutCSS (origin, { space } = {}) {
	const JND = 0.02;
	const ε = 0.0001;

	origin = getColor(origin);

	if (!space) {
		space = origin.space;
	}

	space = ColorSpace.get(space);
	const oklchSpace = ColorSpace.get("oklch");

	if (space.isUnbounded) {
		return to(origin, space);
	}

	const origin_OKLCH = to(origin, oklchSpace);
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

	if (inGamut(origin_OKLCH, space, { epsilon: 0 })) {
		return to(origin_OKLCH, space);
	}

	function clip (_color) {
		const destColor = to(_color, space);
		const spaceCoords = Object.values(/** @type {ColorSpace} */ (space).coords);
		destColor.coords = /** @type {[number, number, number]} */ (
			destColor.coords.map((coord, index) => {
				if ("range" in spaceCoords[index]) {
					const [min, max] = spaceCoords[index].range;
					return util.clamp(min, coord, max);
				}
				return coord;
			})
		);
		return destColor;
	}
	let min = 0;
	let max = origin_OKLCH.coords[1];
	let min_inGamut = true;
	let current = clone(origin_OKLCH);
	let clipped = clip(current);

	let E = deltaEOK(clipped, current);
	if (E < JND) {
		return clipped;
	}

	while (max - min > ε) {
		const chroma = (min + max) / 2;
		current.coords[1] = chroma;
		if (min_inGamut && inGamut(current, space, { epsilon: 0 })) {
			min = chroma;
		}
		else {
			clipped = clip(current);
			E = deltaEOK(clipped, current);
			if (E < JND) {
				if (JND - E < ε) {
					break;
				}
				else {
					min_inGamut = false;
					min = chroma;
				}
			}
			else {
				max = chroma;
			}
		}
	}
	return clipped;
}
