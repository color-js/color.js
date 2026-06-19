import ColorSpace from "./ColorSpace.js";
import toGamut from "./toGamut.js";
import { isNone } from "./util.js";

/** @import { SpaceOptions } from "./ColorSpace.js" */

/**
 * A color space whose chroma-like coordinate is expressed relative to an RGB gamut: chroma = 1 is
 * the most colorful in-gamut color for the rest of the coordinates, so any chroma in [0, 1] stays
 * in gamut. The reduced coordinate (`chroma`, default `"c"`) is rescaled against `gamutSpace`; every
 * other coordinate is inherited unchanged from `base`. Works for any base whose chroma coordinate
 * brings the color into gamut as it is reduced (e.g. OKLCh, LCH).
 */
export default class GamutRelativeColorSpace extends ColorSpace {
	/**
	 * @param {SpaceOptions & { gamutSpace: string | ColorSpace, chroma?: string }} options
	 *        Requires `base` (the source space) and `gamutSpace` (the RGB gamut). `chroma` names the
	 *        coordinate to rescale (default `"c"`).
	 */
	constructor (options) {
		let base = ColorSpace.get(options.base);
		let chroma = options.chroma ?? "c";
		let ids = Object.keys(base.coords);
		let chromaIndex = ids.indexOf(chroma);

		if (chromaIndex === -1) {
			throw new TypeError(
				`GamutRelativeColorSpace needs a "${chroma}" coordinate, got ${base.id}`,
			);
		}

		// Inherit the base's coords; the reduced coordinate becomes a 0–1 fraction of its gamut maximum
		let coords = Object.fromEntries(
			Object.entries(base.coords).map(([id, meta]) => [id, { ...meta }]),
		);
		coords[chroma].range = [0, 1];
		delete coords[chroma].refRange;
		options.coords ??= coords;

		// Serialize the reduced coordinate and any other 0–1 coordinate as percentages; angles as angles
		options.formats ??= {
			color: {
				coords: ids.map(id => {
					if (base.coords[id].type === "angle") {
						return "<number> | <angle>";
					}
					let [min, max] = base.coords[id].range ?? base.coords[id].refRange ?? [];
					let pctFirst = id === chroma || (min === 0 && max === 1);
					return pctFirst ? "<percentage> | <number>" : "<number> | <percentage>";
				}),
			},
		};

		super(options);

		this.chromaIndex = chromaIndex;
		this.method = `${base.id}.${chroma}`;

		// A chroma that is out of gamut at every lightness and hue: the gamut's most saturated corner
		// (its primaries/secondaries are its chroma maxima) plus headroom. Seeding the gamut search
		// from here lands on the first in-gamut crossing — the highest contiguous in-gamut chroma —
		// and avoids clamping wide gamuts (e.g. Rec.2020 exceeds OKLCh's nominal 0.4 chroma).
		// prettier-ignore
		let corners = /** @type {[number, number, number][]} */ (
			[[0, 0, 1], [0, 1, 0], [0, 1, 1], [1, 0, 0], [1, 0, 1], [1, 1, 0]]
		);
		this.oogChroma =
			1.01 *
			Math.max(...corners.map(rgb => base.from(this.gamutSpace, rgb)[this.chromaIndex] || 0));
	}

	/**
	 * The highest in-gamut value of the reduced coordinate for the given coordinates. The reduced
	 * coordinate's own value is ignored; the others determine the result.
	 * @param {number[]} coords
	 * @returns {number}
	 */
	maxChroma (coords) {
		let seed = /** @type {[number, number, number]} */ ([...coords]);
		seed[this.chromaIndex] = this.oogChroma;

		return toGamut(
			{ space: this.base, coords: seed },
			// deltaE OK stays sensitive near black, where deltaE 2000 is too forgiving of excess chroma
			{ space: this.gamutSpace, method: this.method, deltaEMethod: "OK", jnd: 0 },
		).coords[this.chromaIndex];
	}

	toBase (coords) {
		coords = [...coords];

		if (coords.some((c, i) => i !== this.chromaIndex && isNone(c))) {
			// chroma is a fraction of maxChroma(the other coords); without them all it is undefined
			if (coords[this.chromaIndex] !== 0) {
				coords[this.chromaIndex] = null;
			}
		}
		else if (!isNone(coords[this.chromaIndex])) {
			coords[this.chromaIndex] *= this.maxChroma(coords);
		}

		return coords;
	}

	fromBase (coords) {
		coords = [...coords];

		if (coords.some((c, i) => i !== this.chromaIndex && isNone(c))) {
			if (coords[this.chromaIndex] !== 0) {
				coords[this.chromaIndex] = null;
			}
		}
		else if (!isNone(coords[this.chromaIndex])) {
			let cMax = this.maxChroma(coords);
			coords[this.chromaIndex] = cMax ? coords[this.chromaIndex] / cMax : 0;
		}

		return coords;
	}
}
