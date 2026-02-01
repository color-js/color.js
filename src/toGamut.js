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
import RGBColorSpace from "./RGBColorSpace.js";

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
	else if (method === "raytrace") {
		spaceColor = toGamutRayTrace(color, { space });
	}
	else {
		if (method !== "clip") {
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

/**
 * Given `start` and `end` coordinates of a 3D ray and a `bmin` and `bmax` bounding box,
 * find the intersection of the ray and box. Return an empty list if no intersect is found.`
 * @param {[number, number, number]} start
 * @param {[number, number, number]} end
 * @param {[number, number, number]} bmin
 * @param {[number, number, number]} bmax
 * @returns {[number, number, number] | []}
 */
function raytrace_box (start, end, bmin = [0, 0, 0], bmax = [1, 1, 1]) {
	// Use slab method to detect intersection of ray and box and return intersect.
	// https://en.wikipedia.org/wiki/Slab_method

	// Calculate whether there was a hit
	let tfar = Infinity;
	let tnear = -Infinity;
	let direction = [];

	for (let i = 0; i < 3; i++) {
		const a = start[i];
		const b = end[i];
		const d = b - a;
		const bn = bmin[i];
		const bx = bmax[i];
		direction.push(d);

		// Non parallel cases
		if (Math.abs(d) > 1e-15) {
			const inv_d = 1 / d;
			const t1 = (bn - a) * inv_d;
			const t2 = (bx - a) * inv_d;
			tnear = Math.max(Math.min(t1, t2), tnear);
			tfar = Math.min(Math.max(t1, t2), tfar);
		}

		// Impossible parallel case
		else if (a < bn || a > bx) {
			return [];
		}
	}

	// No hit
	if (tnear > tfar || tfar < 0) {
		return [];
	}

	// Favor the intersection first in the direction start -> end
	if (tnear < 0) {
		tnear = tfar;
	}

	// A point, or something approaching a single point where start and end are the same.
	if (!isFinite(tnear)) {
		return [];
	}

	// Calculate nearest intersection via interpolation
	return [
		start[0] + direction[0] * tnear,
		start[1] + direction[1] * tnear,
		start[2] + direction[2] * tnear,
	];
}

/**
 * Given a color `origin`, returns a new color that is in gamut using
 * the CSS Ray Trace Gamut Mapping Algorithm. If `space` is specified,
 * it will be in gamut `space`, and returned in `space`. Otherwise,
 * it will be in gamut and returned in the color space of `origin`.
 * @param {ColorTypes} origin
 * @param {{ space?: string | ColorSpace | undefined }} param1
 * @returns {PlainColorObject}
 */
export function toGamutRayTrace (origin, { space } = {}) {
	origin = getColor(origin);

	if (!space) {
		space = origin.space;
	}

	space = ColorSpace.get(space);

	// If the space is already in gamut, stop.
	if (space.isUnbounded || inGamut(origin, space, { epsilon: 0 })) {
		return to(origin, space);
	}

	// Get the OkLCh coordinates.
	const oklchSpace = ColorSpace.get("oklch");
	let oklchOrigin = to(origin, oklchSpace);
	let [lightness, chroma, hue] = oklchOrigin.coords;

	// Return white or black if color's lightness exceeds the SDR range.
	if (lightness >= 1) {
		const white = to(COLORS.WHITE, space);
		white.alpha = origin.alpha;
		return to(white, space);
	}
	else if (lightness <= 0) {
		const black = to(COLORS.BLACK, space);
		black.alpha = origin.alpha;
		return to(black, space);
	}

	// Get a copy of the origin color as the RGB target space.
	const originSpace = space;
	const rGamut = space.rgbGamut;
	if (rGamut !== undefined) {
		space = rGamut;
	}

	if (!util.isInstance(space, RGBColorSpace)) {
		throw Error('An RGB gamut is required')
	}

	// Get SDR bounds. Some HDR spaces have headroom, so reduce max to SDR range.
	let coords = space.coords;
	let [mn, mx] = coords[Object.keys(coords)[0]].range;
	let max = /** @type {[number, number, number]} */ ([mx, mx, mx]);

	// See if we have a linear version of the color space
	const lGamut = space.linearGamut;
	if (lGamut !== undefined) {
		// Recalculate minimum and maximum relative to the linear space
		let temp = to({ space: space, coords: max, alpha: origin.alpha }, lGamut);
		mx = temp.coords[0];
		max = /** @type {[number, number, number]} */ ([mx, mx, mx]);
		space = lGamut;
		coords = space.coords
		mn = coords[Object.keys(coords)[0]].range[0];
	}
	let min = /** @type {[number, number, number]} */ ([mn, mn, mn]);
	let rgbOrigin = to(oklchOrigin, space);

	// If this were performed within a perceptual space like CAM16, which has achromatics that do not align
	// with the RGB achromatic line, projecting the color onto the RGB achromatic line may be preferable,
	// but since OkLCh's achromatics align with all CSS RGB spaces, just set chroma to zero.
	let anchor = to({ space: oklchSpace, coords: [lightness, 0, hue] }, space).coords;

	// Calculate bounds to adjust the anchor closer to the gamut surface.
	// We don't want to make the ray too short, so offset some amount from the low and high range.
	const low = mn + 1e-6;
	const high = mx - 1e-6;

	// Cast a ray from the zero chroma color to the target color.
	// Trace the line to the RGB cube edge and find where it intersects.
	// Correct L and h within the perceptual OkLCh after each attempt.
	let last = rgbOrigin.coords;
	for (let i = 0; i < 4; i++) {
		if (i) {
			// For constant luminance, we correct the color by simply setting lightness and hue to
			// match the original color. In a non constant luminance reduction, it is better to
			// project the color onto the reduction path vector.
			const oklch = to(rgbOrigin, oklchSpace);
			oklch.coords[0] = lightness;
			oklch.coords[2] = hue;
			rgbOrigin = to(oklch, space);
		}
		// Cast a ray from the achromatic anchor to the RGB target and find the gamut intersection.
		const intersection = raytrace_box(anchor, rgbOrigin.coords, min, max);

		// If we cannot find an intersection, reset to last successful iteration of the color.
		// In OkLCh, this is only likely to happen if our ray gets too small, in that case, it is time to stop.
		if (intersection.length === 0) {
			rgbOrigin.coords = last;
			break;
		}

		// Adjust anchor point closer to surface, when possible, to improve results for some spaces.
		if (i && rgbOrigin.coords.every(x => low < x && x < high)) {
			anchor = rgbOrigin.coords;
		}

		// If we have an intersection, update the color.
		last = /** @type {[number, number, number]} */ (intersection);
		rgbOrigin.coords = intersection;
	}

	// Convert to the original, specified gamut
	rgbOrigin = to(rgbOrigin, originSpace)
	const spaceCoords = Object.values(/** @type {ColorSpace} */ (originSpace).coords);

	// Remove noise from floating point math by clipping
	rgbOrigin.coords = /** @type {[number, number, number]} */ (
		rgbOrigin.coords.map((coord, index) => {
			if ("range" in spaceCoords[index]) {
				const [lower, upper] = spaceCoords[index].range;
				return util.clamp(lower, coord, upper);
			}
			return coord;
		})
	);

	return rgbOrigin;
}
