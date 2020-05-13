import Color, {util} from "./color.js";

let methods = {
	/**
	 * Interpolate to color2 and return a function that takes a 0-1 percentage
	 * @returns {Function}
	 */
	range (color2, {space, outputSpace} = {}) {
		let color1 = this;
		color2 = Color.get(color2);

		if (space) {
			space = Color.space(space);
		}
		else {
			space = Color.spaces[Color.defaults.interpolationSpace] || color1.space;
		}

		outputSpace = outputSpace? Color.space(outputSpace) : color1.space || space;

		color1 = color1.to(space);
		color2 = color2.to(space);

		let range = color1.coords.map((coord, i) => color2.coords[i] - coord);
		let alphaRange = color2.alpha - color1.alpha;

		let ret = p => {
			let coords = color1.coords.map((coord, i) => coord + range[i] * p);
			let alpha = color1.alpha + alphaRange * p;
			let ret = new Color(space, coords, alpha);

			return outputSpace !== space? ret.to(outputSpace) : ret;
		};

		ret.colorRange = true;

		return ret;
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
	steps (color2, {space, outputSpace, delta, steps = 2, maxSteps = 1000} = {}) {
		let range;
		let ret = [];

		if (typeof color2 === "function" && color2.colorRange) {
			// Color range already provided
			[range, color2] = [color2, color2(1)];
		}
		else {
			color2 = Color.get(color2);
			range = this.range(color2, {space, outputSpace});
		}

		let totalDelta = this.deltaE(color2);
		let actualSteps = delta > 0? Math.max(steps, Math.ceil(totalDelta / delta) + 1) : steps;

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

		if (delta > 0) {
			// Iterate over all stops and find max delta
			let maxDelta = ret.reduce((acc, cur, i) => i === 0? 0 : Math.max(acc, cur.color.deltaE(ret[i - 1].color)), 0);

			while (maxDelta > delta) {
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
	}
};

Color.steps = function(color, ...args) {
	if (typeof color === "function" && color.colorRange) {
		// Color.steps(range, options)
		return color(0).steps(color, ...args);
	}
	else {
		color = Color.get(color);
	}

	return color.steps(...args);
};

Object.assign(Color.defaults, {
	interpolationSpace: "lab"
});

Object.assign(Color.prototype, methods);
Color.statify(Object.keys(methods));

export default Color;
