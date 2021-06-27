import Color, {util} from "./color.js";
import * as angles from "./angles.js";

let methods = {
	range (...args) {
		return Color.range(this, ...args);
	},

	/**
	 * Return an intermediate color between two colors
	 * Signatures: color.mix(color, p, options)
	 *             color.mix(color, options)
	 *             color.mix(color)
	 */
	mix (color, p = .5, o = {}) {
		if (util.type(p) === "object") {
			[p, o] = [.5, p];
		}

		let {space, outputSpace} = o;

		color = Color.get(color);
		let range = this.range(color, {space, outputSpace});
		return range(p);
	},

	/**
	 * Interpolate to color2 and return an array of colors
	 * @returns {Array[Color]}
	 */
	steps (...args) {
		return Color.steps(this, ...args);
	}
};

Color.steps = function(color1, color2, options = {}) {
	let range;

	if (isRange(color1)) {
		// Tweaking existing range
		[range, options] = [color1, color2];
		[color1, color2] = range.rangeArgs.colors;
	}

	let {
		maxDeltaE, deltaEMethod,
		steps = 2, maxSteps = 1000,
		...rangeOptions
	} = options;

	if (!range) {
		color1 = Color.get(color1);
		color2 = Color.get(color2);
		range = Color.range(color1, color2, rangeOptions);
	}

	let totalDelta = this.deltaE(color2);
	let actualSteps = maxDeltaE > 0? Math.max(steps, Math.ceil(totalDelta / maxDeltaE) + 1) : steps;
	let ret = [];

	if (maxSteps !== undefined) {
		actualSteps = Math.min(actualSteps, maxSteps);
	}

	if (actualSteps === 1) {
		ret = [{p: .5, color: range(.5)}];
	}
	else {
		let step = 1 / (actualSteps - 1);
		ret = Array.from({length: actualSteps}, (_, i) => {
			let p = i * step;
			return {p, color: range(p)};
		});
	}

	if (maxDeltaE > 0) {
		// Iterate over all stops and find max deltaE
		let maxDelta = ret.reduce((acc, cur, i) => {
			if (i === 0) {
				return 0;
			}

			let deltaE = cur.color.deltaE(ret[i - 1].color, deltaEMethod);
			return Math.max(acc, deltaE);
		}, 0);

		while (maxDelta > maxDeltaE) {
			// Insert intermediate stops and measure maxDelta again
			// We need to do this for all pairs, otherwise the midpoint shifts
			maxDelta = 0;

			for (let i = 1; (i < ret.length) && (ret.length < maxSteps); i++) {
				let prev = ret[i - 1];
				let cur = ret[i];

				let p = (cur.p + prev.p) / 2;
				let color = range(p);
				maxDelta = Math.max(maxDelta, color.deltaE(prev.color), color.deltaE(cur.color));
				ret.splice(i, 0, {p, color: range(p)});
				i++;
			}
		}
	}

	ret = ret.map(a => a.color);

	return ret;
};

/**
 * Interpolate to color2 and return a function that takes a 0-1 percentage
 * @returns {Function}
 */
Color.range = function(color1, color2, options = {}) {
	if (isRange(color1)) {
		// Tweaking existing range
		let [range, options] = [color1, color2];
		return Color.range(...range.rangeArgs.colors, {...range.rangeArgs.options, ...options});
	}

	let {space, outputSpace, progression, premultiplied} = options;

	// Make sure we're working on copies of these colors
	color1 = new Color(color1);
	color2 = new Color(color2);


	let rangeArgs = {colors: [color1, color2], options};

	if (space) {
		space = Color.space(space);
	}
	else {
		space = Color.spaces[Color.defaults.interpolationSpace] || color1.space;
	}

	outputSpace = outputSpace? Color.space(outputSpace) : (color1.space || space);

	color1 = color1.to(space).toGamut();
	color2 = color2.to(space).toGamut();

	// Handle hue interpolation
	// See https://github.com/w3c/csswg-drafts/issues/4735#issuecomment-635741840
	if (space.coords.hue && space.coords.hue.isAngle) {
		let arc = options.hue = options.hue || "shorter";

		[color1[space.id].hue, color2[space.id].hue] = angles.adjust(arc, [color1[space.id].hue, color2[space.id].hue]);
	}

	if (premultiplied) {
		// not coping with polar spaces yet
		color1.coords = color1.coords.map (c => c * color1.alpha);
		color2.coords = color2.coords.map (c => c * color2.alpha);
	}

	return Object.assign(p => {
		p = progression? progression(p) : p;
		let coords = color1.coords.map((start, i) => {
			let end = color2.coords[i];
			return interpolate(start, end, p);
		});
		let alpha = interpolate(color1.alpha, color2.alpha, p);
		let ret = new Color(space, coords, alpha);

		if (premultiplied) {
			// undo premultiplication
			ret.coords = ret.coords.map(c => c / alpha);
		}

		if (outputSpace !== space) {
			ret = ret.to(outputSpace);
		}

		return ret;
	}, {
		rangeArgs
	});
};

export function isRange (val) {
	return util.type(val) === "function" && val.rangeArgs;
}

// Helper
function interpolate(start, end, p) {
	if (isNaN(start)) {
		return end;
	}

	if (isNaN(end)) {
		return start;
	}

	return start + (end - start) * p;
}

Object.assign(Color.defaults, {
	interpolationSpace: "lab"
});

Object.assign(Color.prototype, methods);
Color.statify(Object.keys(methods));

export default Color;
