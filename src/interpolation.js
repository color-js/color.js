import Color, {util} from "./color.js";

let methods = {
	/**
	 * Interpolate to color2 and return a function that takes a 0-1 percentage
	 * @returns {Function}
	 */
	range (color2, {space, outputSpace} = {}) {
		let color1 = this;
		color2 = Color.get(color2);
		space = Color.space(space);

		if (!space) {
			// If colors in the same space, interpolation happens in that, otherwise Lab
			if (color1.space === color2.space || !Color.spaces.lab) {
				space = color1.space;
			}
			else {
				space = Color.spaces.lab;
			}
		}

		outputSpace = outputSpace || color1.space || space;

		color1 = color1.to(space);
		color2 = color2.to(space);

		let range = color1.coords.map((coord, i) => color2.coords[i] - coord);
		let alphaRange = color2.alpha - color1.alpha;

		return p => {
			let coords = color1.coords.map((coord, i) => coord + range[i] * p);
			let alpha = color1.alpha + alphaRange * p;
			let ret = new Color(space, coords, alpha);

			return outputSpace !== space? ret.to(outputSpace) : ret;
		};
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
		color2 = Color.get(color2);
		let range = this.range(color2, {space, outputSpace});

		let ret = [];

		if (steps === 1) {
			ret = [{p: .5, color: range(.5)}];
		}
		else {
			let step = 1 / (steps - 1);
			ret = Array.from({length: steps}, (_, i) => {
				let p = i * step;
				return {p, color: range(p)};
			});
		}


		if (delta > 0) {
			// Iteratively add intermediate stops until deltaE between any
			// consecutive colors is smaller than maxDelta
			for (let i = 1; (i < ret.length) && (ret.length < maxSteps); i++) {
				let prev = ret[i - 1];
				let cur = ret[i];

				if (prev.color.deltaE(cur.color) > delta) {
					let p = (cur.p + prev.p) / 2;
					ret.splice(i, 0, {p, color: range(p)});
					i--;
				}
			}
		}

		ret = ret.map(a => a.color);

		return ret;
	}
};

Object.assign(Color.prototype, methods);
Color.statify(Object.keys(methods));

export default Color;
