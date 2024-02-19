/**
 * Functions related to color interpolation
 */
import ColorSpace from "./space.js";
import {type, interpolate} from "./util.js";
import getColor from "./getColor.js";
import clone from "./clone.js";
import to from "./to.js";
import toGamut from "./toGamut.js";
import get from "./get.js";
import set from "./set.js";
import defaults from "./defaults.js";
import * as angles from "./angles.js";
import deltaE from "./deltaE.js";

/**
 * Return an intermediate color between two colors
 * Signatures: mix(c1, c2, p, options)
 *             mix(c1, c2, options)
 *             mix(color)
 * @param {Color | string} c1 The first color
 * @param {Color | string} [c2] The second color
 * @param {number} [p=.5] A 0-1 percentage where 0 is c1 and 1 is c2
 * @param {Object} [o={}]
 * @return {Color}
 */
export function mix (c1, c2, p = .5, o = {}) {
	[c1, c2] = [getColor(c1), getColor(c2)];

	if (type(p) === "object") {
		[p, o] = [.5, p];
	}

	let r = range(c1, c2, o);
	return r(p);
}

/**
 *
 * @param {Color | string | Function} c1 The first color or a range
 * @param {Color | string} [c2] The second color if c1 is not a range
 * @param {Object} [options={}]
 * @return {Color[]}
 */
export function steps (c1, c2, options = {}) {
	let colorRange;

	if (isRange(c1)) {
		// Tweaking existing range
		[colorRange, options] = [c1, c2];
		[c1, c2] = colorRange.rangeArgs.colors;
	}

	let {
		maxDeltaE, deltaEMethod,
		steps = 2, maxSteps = 1000,
		...rangeOptions
	} = options;

	if (!colorRange) {
		[c1, c2] = [getColor(c1), getColor(c2)];
		colorRange = range(c1, c2, rangeOptions);
	}

	let totalDelta = deltaE(c1, c2);
	let actualSteps = maxDeltaE > 0 ? Math.max(steps, Math.ceil(totalDelta / maxDeltaE) + 1) : steps;
	let ret = [];

	if (maxSteps !== undefined) {
		actualSteps = Math.min(actualSteps, maxSteps);
	}

	if (actualSteps === 1) {
		ret = [{p: .5, color: colorRange(.5)}];
	}
	else {
		let step = 1 / (actualSteps - 1);
		ret = Array.from({length: actualSteps}, (_, i) => {
			let p = i * step;
			return {p, color: colorRange(p)};
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

			for (let i = 1; (i < ret.length) && (ret.length < maxSteps); i++) {
				let prev = ret[i - 1];
				let cur = ret[i];

				let p = (cur.p + prev.p) / 2;
				let color = colorRange(p);
				maxDelta = Math.max(maxDelta, deltaE(color, prev.color), deltaE(color, cur.color));
				ret.splice(i, 0, {p, color: colorRange(p)});
				i++;
			}
		}
	}

	ret = ret.map(a => a.color);

	return ret;
}

/**
 * Interpolate to color2 and return a function that takes a 0-1 percentage
 * @param {Color | string | Function} color1 The first color or an existing range
 * @param {Color | string} [color2] If color1 is a color, this is the second color
 * @param {Object} [options={}]
 * @returns {Function} A function that takes a 0-1 percentage and returns a color
 */
export function range (color1, color2, options = {}) {
	if (isRange(color1)) {
		// Tweaking existing range
		let [r, options] = [color1, color2];

		return range(...r.rangeArgs.colors, {...r.rangeArgs.options, ...options});
	}

	let {space, outputSpace, progression, premultiplied} = options;

	color1 = getColor(color1);
	color2 = getColor(color2);

	// Make sure we're working on copies of these colors
	color1 = clone(color1);
	color2 = clone(color2);

	let rangeArgs = {colors: [color1, color2], options};

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
		let arc = options.hue = options.hue || "shorter";

		let hue = [space, "h"];
		let [θ1, θ2] = [get(color1, hue), get(color2, hue)];
		// Undefined hues must be evaluated before hue fix-up to properly
		// calculate hue arcs between undefined and defined hues.
		// See https://github.com/w3c/csswg-drafts/issues/9436#issuecomment-1746957545
		if (isNaN(θ1) && !isNaN(θ2)) {
			θ1 = θ2;
		}
		else if (isNaN(θ2) && !isNaN(θ1)) {
			θ2 = θ1;
		}
		[θ1, θ2] = angles.adjust(arc, [θ1, θ2]);
		set(color1, hue, θ1);
		set(color2, hue, θ2);
	}

	if (premultiplied) {
		// not coping with polar spaces yet
		color1.coords = color1.coords.map(c => c * color1.alpha);
		color2.coords = color2.coords.map(c => c * color2.alpha);
	}

	return Object.assign(p => {
		p = progression ? progression(p) : p;
		let coords = color1.coords.map((start, i) => {
			let end = color2.coords[i];
			return interpolate(start, end, p);
		});

		let alpha = interpolate(color1.alpha, color2.alpha, p);
		let ret = {space, coords, alpha};

		if (premultiplied) {
			// undo premultiplication
			ret.coords = ret.coords.map(c => c / alpha);
		}

		if (outputSpace !== space) {
			ret = to(ret, outputSpace);
		}

		return ret;
	}, {
		rangeArgs,
	});
}

export function isRange (val) {
	return type(val) === "function" && !!val.rangeArgs;
}

defaults.interpolationSpace = "lab";

export function register (Color) {
	Color.defineFunction("mix", mix, {returns: "color"});
	Color.defineFunction("range", range, {returns: "function<color>"});
	Color.defineFunction("steps", steps, {returns: "array<color>"});
}
