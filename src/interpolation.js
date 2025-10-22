/**
 * Functions related to color interpolation
 */
import ColorSpace from "./ColorSpace.js";
import { type, interpolate, isNone } from "./util.js";
import getColor from "./getColor.js";
import clone from "./clone.js";
import to from "./to.js";
import toGamut from "./toGamut.js";
import get from "./get.js";
import set from "./set.js";
import defaults from "./defaults.js";
import * as angles from "./angles.js";
import deltaE from "./deltaE.js";

/** @import { ColorTypes, PlainColorObject, Ref } from "./types.js" */

// Type re-exports
/** @typedef {import("./types.js").MixOptions} MixOptions */
/** @typedef {import("./types.js").Range} Range */
/** @typedef {import("./types.js").RangeOptions} RangeOptions */
/** @typedef {import("./types.js").StepsOptions} StepsOptions */

/**
 * Return an intermediate color between two colors
 * @overload
 * @param {ColorTypes} c1
 * @param {ColorTypes} c2
 * @param {MixOptions} [options]
 * @returns {PlainColorObject}
 */
/**
 * @overload
 * @param {ColorTypes} c1
 * @param {ColorTypes} c2
 * @param {number} [p=0.5]
 * @param {MixOptions} [options]
 * @returns {PlainColorObject}
 */
export function mix (c1, c2, p, o = {}) {
	[c1, c2] = [getColor(c1), getColor(c2)];

	if (type(p) === "object") {
		[p, o] = [0.5, p];
	}

	let r = range(c1, c2, o);
	return r(p ?? 0.5); // why not give p a default value like we do for options? Overloading doesn't work, and TS complains
}

/**
 * Get an array of discrete steps
 * @overload
 * @param {ColorTypes} c1
 * @param {ColorTypes} c2
 * @param {StepsOptions} [options]
 * @returns {PlainColorObject[]}
 */
/**
 * @overload
 * @param {Range} range
 * @param {StepsOptions} [options]
 * @returns {PlainColorObject[]}
 */
export function steps (c1, c2, options = {}) {
	let colorRange;

	if (isRange(c1)) {
		// Tweaking existing range
		[colorRange, options] = [c1, c2];
		[c1, c2] = colorRange.rangeArgs.colors;
	}

	let { maxDeltaE, deltaEMethod, steps = 2, maxSteps = 1000, ...rangeOptions } = options;

	if (!colorRange) {
		[c1, c2] = [getColor(c1), getColor(c2)];
		colorRange = range(c1, c2, rangeOptions);
	}

	let totalDelta = deltaE(c1, c2);
	let actualSteps =
		maxDeltaE > 0 ? Math.max(steps, Math.ceil(totalDelta / maxDeltaE) + 1) : steps;
	let ret = [];

	if (maxSteps !== undefined) {
		actualSteps = Math.min(actualSteps, maxSteps);
	}

	if (actualSteps === 1) {
		ret = [{ p: 0.5, color: colorRange(0.5) }];
	}
	else {
		let step = 1 / (actualSteps - 1);
		ret = Array.from({ length: actualSteps }, (_, i) => {
			let p = i * step;
			return { p, color: colorRange(p) };
		});
	}

	if (maxDeltaE > 0) {
		// Iterate over all stops and find max deltaE
		let maxDelta = ret.reduce((acc, cur, i) => {
			if (i === 0) {
				return 0;
			}

			let ΔΕ = deltaE(cur.color, ret[i - 1].color, deltaEMethod);
			return Math.max(acc, ΔΕ);
		}, 0);

		while (maxDelta > maxDeltaE) {
			// Insert intermediate stops and measure maxDelta again
			// We need to do this for all pairs, otherwise the midpoint shifts
			maxDelta = 0;

			for (let i = 1; i < ret.length && ret.length < maxSteps; i++) {
				let prev = ret[i - 1];
				let cur = ret[i];

				let p = (cur.p + prev.p) / 2;
				let color = colorRange(p);
				maxDelta = Math.max(maxDelta, deltaE(color, prev.color), deltaE(color, cur.color));
				ret.splice(i, 0, { p, color: colorRange(p) });
				i++;
			}
		}
	}

	ret = ret.map(a => a.color);

	return ret;
}

/**
 * Creates a function that accepts a number and returns a color.
 * For numbers in the range 0 to 1, the function interpolates;
 * for numbers outside that range, the function extrapolates
 * (and thus may not return the results you expect)
 * @overload
 * @param {Range} range
 * @param {RangeOptions} [options]
 * @returns {Range}
 */
/**
 * @overload
 * @param {ColorTypes} color1
 * @param {ColorTypes} color2
 * @param {RangeOptions & Record<string, any>} [options]
 * @returns {Range}
 */
export function range (color1, color2, options = {}) {
	if (isRange(color1)) {
		// Tweaking existing range
		let [r, options] = [color1, color2];

		return range(...r.rangeArgs.colors, { ...r.rangeArgs.options, ...options });
	}

	let { space, outputSpace, progression, premultiplied } = options;

	color1 = getColor(color1);
	color2 = getColor(color2);

	// Make sure we're working on copies of these colors
	color1 = clone(color1);
	color2 = clone(color2);

	let rangeArgs = { colors: [color1, color2], options };

	if (space) {
		space = ColorSpace.get(space);
	}
	else {
		space = ColorSpace.registry[defaults.interpolationSpace] || color1.space;
	}

	outputSpace = outputSpace ? ColorSpace.get(outputSpace) : space;

	color1 = to(color1, space);
	color2 = to(color2, space);

	// Gamut map to avoid areas of flat color
	color1 = toGamut(color1);
	color2 = toGamut(color2);

	// Handle hue interpolation
	// See https://github.com/w3c/csswg-drafts/issues/4735#issuecomment-635741840
	if (space.coords.h && space.coords.h.type === "angle") {
		let arc = (options.hue = options.hue || "shorter");

		let /** @type {Ref} */ hue = [space, "h"];
		let [θ1, θ2] = [get(color1, hue), get(color2, hue)];
		// Undefined hues must be evaluated before hue fix-up to properly
		// calculate hue arcs between undefined and defined hues.
		// See https://github.com/w3c/csswg-drafts/issues/9436#issuecomment-1746957545
		if (isNone(θ1) && !isNone(θ2)) {
			θ1 = θ2;
		}
		else if (isNone(θ2) && !isNone(θ1)) {
			θ2 = θ1;
		}
		[θ1, θ2] = angles.adjust(arc, [θ1, θ2]);
		set(color1, hue, θ1);
		set(color2, hue, θ2);
	}

	if (premultiplied) {
		// not coping with polar spaces yet
		color1.coords = /** @type {[number, number, number]} */ (
			color1.coords.map(c => c * color1.alpha)
		);
		color2.coords = /** @type {[number, number, number]} */ (
			color2.coords.map(c => c * color2.alpha)
		);
	}

	return Object.assign(
		p => {
			p = progression ? progression(p) : p;
			let coords = color1.coords.map((start, i) => {
				let end = color2.coords[i];
				return interpolate(start, end, p);
			});

			let alpha = interpolate(color1.alpha, color2.alpha, p);
			let ret = { space, coords, alpha };

			if (premultiplied) {
				// undo premultiplication
				ret.coords = ret.coords.map(c => c / alpha);
			}

			if (outputSpace !== space) {
				ret = to(ret, outputSpace);
			}

			return ret;
		},
		{
			rangeArgs,
		},
	);
}

/**
 * @param {any} val
 * @returns {val is Range}
 */
export function isRange (val) {
	return type(val) === "function" && !!val.rangeArgs;
}

defaults.interpolationSpace = "lab";

/**
 * @param {typeof import("./color.js").default} Color
 */
export function register (Color) {
	Color.defineFunction("mix", mix, { returns: "color" });
	Color.defineFunction("range", range, { returns: "function<color>" });
	Color.defineFunction("steps", steps, { returns: "array<color>" });
}
