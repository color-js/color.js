import * as util from "./util.js";
import hooks from "./hooks.js";
import ColorSpace from "./space.js";
import {WHITES} from "./adapt.js";
import {deltaE} from "./deltaE.js";

import "./spaces/xyz-d50.js";
import "./spaces/xyz-d65.js";
import "./spaces/srgb.js";

const ε = .000075;
const hasDOM = typeof document !== "undefined";

export default class Color {
	// Signatures:
	// new Color(stringToParse)
	// new Color(otherColor)
	// new Color(coords, alpha) // defaults to sRGB
	// new Color(CSS variable [, root])
	constructor (...args) {
		let str, color;

		// new Color(color)
		// new Color({spaceId, coords})
		// new Color({space, coords})
		if (args[0] && typeof args[0] === "object" && (args[0].space || args[0].spaceId) && args[0].coords) {
			color = args[0];
		}
		else if (util.isString(args[0])) {
			// new Color("--foo" [, root])
			if (hasDOM && args[0].indexOf("--") === 0) {
				// CSS variable
				let root = arguments[1] && arguments[1].nodeType === 1? arguments[1] : document.documentElement;
				str = getComputedStyle(root).getPropertyValue(arguments[0]);
			}
			 // new Color(string)
			else if (args.length === 1) {
				str = args[0];
			}

			if (str) {
				color = Color.parse(str);
			}
		}

		let {space, spaceId, coords, alpha} = color ?? {};

		if (!color) {
			// default signature new Color([ColorSpace,] array [, alpha])
			if (Array.isArray(args[0])) {
				// No color space provided, default to sRGB
				[spaceId, coords, alpha] = ["srgb", ...args];
			}
			else {
				[spaceId, coords, alpha] = args;
			}
		}

		this.space = ColorSpace.get(space || spaceId);
		this.space = this.space ?? ColorSpace.get("srgb");

		this.coords = coords? coords.slice() : [0, 0, 0];
		this.alpha = alpha < 1? alpha : 1; // this also deals with NaN etc

		// Convert "NaN" to NaN
		for (let i = 0; i < this.coords.length; i++) {
			if (this.coords[i] === "NaN") {
				this.coords[i] = NaN;
			}
		}

		// Make space property immutable
		Object.defineProperty(this, "space", {
			value: this.space,
			enumerable: true,
			configurable: false,
			writable: false
		});

		// Define immutable spaceId property
		Object.defineProperty(this, "spaceId", {
			value: this.space.id,
			enumerable: true,
			configurable: false,
			writable: false
		});

		// Define getters and setters for each coordinate
		for (let id in this.space.coords) {
			Object.defineProperty(this, id, {
				get: () => this.get(id),
				set: value => this.set(id, value)
			});
		}
	}

	get white () {
		return this.space.white;
	}

	get (prop) {
		let {space, index} = ColorSpace.resolveCoord(prop, this.space);
		let coords = this.getAll(space);
		return coords[index];
	}

	getAll (space) {
		space = ColorSpace.get(space);
		return this.space.to(space, this.coords);
	}

	// Set properties and return current instance
	set (prop, value) {
		if (arguments.length === 1 && util.type(arguments[0]) === "object") {
			// Argument is an object literal
			let object = arguments[0];
			for (let p in object) {
				this.set(p, object[p]);
			}
		}
		else {
			if (typeof value === "function") {
				value = value(this.get(prop));
			}

			let {space, index} = ColorSpace.resolveCoord(prop, this.space);
			let coords = this.getAll(space);
			coords[index] = value;
			this.setAll(space, coords);
		}

		return this;
	}

	setAll (space, coords) {
		space = ColorSpace.get(space);
		this.coords = space.to(this.space, coords);
		return this;
	}

	lighten (amount = .25) {
		return new Color(this).set("lch.l", l => l * (1 + amount));
	}

	darken (amount = .25) {
		return new Color(this).set("lch.l", l => l * (1 - amount));
	}

	// Euclidean distance of colors in an arbitrary color space
	distance (color, space = "lab") {
		color = Color.get(color);
		space = ColorSpace.get(space);

		let coords1 = this[space.id];
		let coords2 = color[space.id];

		return Math.sqrt(coords1.reduce((a, c, i) => {
			if (isNaN(c) || isNaN(coords2[i])) {
				return a;
			}

			return a + (coords2[i] - c) ** 2;
		}, 0));
	}

	deltaE(...args) {
		return deltaE(this, ...args);
	}

	// Relative luminance
	get luminance () {
		return this.xyz.Y;
	}

	set luminance (value) {
		this.xyz.Y = value;
	}

	// WCAG 2.0 contrast https://www.w3.org/TR/WCAG20-TECHS/G18.html
	contrast (color) {
		color = Color.get(color);
		let L1 = this.luminance;
		let L2 = color.luminance;

		if (L2 > L1) {
			[L1, L2] = [L2, L1];
		}

		return (L1 + .05) / (L2 + .05);
	}

	// Chromaticity coordinates
	get uv () {
		let [X, Y, Z] = this.xyz;
		let denom = X + 15 * Y + 3 * Z;
		return [4 * X / denom, 9 * Y / denom];
	}

	get xy () {
		let [X, Y, Z] = this.xyz;
		let  sum = X + Y + Z;
		return [X / sum, Y / sum];
	}
	// no setters, as lightness information is lost
	// when converting color to chromaticity

	// Get formatted coords
	getCoords ({inGamut, precision = Color.defaults.precision} = {}) {
		let coords = this.coords;

		if (inGamut && !this.inGamut()) {
			coords = this.toGamut(inGamut === true? undefined : inGamut).coords;
		}

		if (precision !== undefined && precision !== null) {
			let bounds = Object.values(this.space.coords).map(c => c.range || c.refRange);

			coords = coords.map((n, i) => util.toPrecision(n, precision, bounds[i]));
		}

		return coords;
	}

	/**
	 * @return {Boolean} Is the color in gamut?
	 */
	inGamut (space = this.space, options) {
		return Color.inGamut(space, this.to(space).coords, options);
	}

	static inGamut (space, coords, {epsilon = ε} = {}) {
		space = ColorSpace.get(space);

		return space.inGamut(coords, {epsilon});
	}

	/**
	 * Force coordinates in gamut of a certain color space and return the result
	 * @param {Object} options
	 * @param {string} options.method - How to force into gamut.
	 *        If "clip", coordinates are just clipped to their reference range.
	 *        If in the form [colorSpaceId].[coordName], that coordinate is reduced
	 *        until the color is in gamut. Please note that this may produce nonsensical
	 *        results for certain coordinates (e.g. hue) or infinite loops if reducing the coordinate never brings the color in gamut.
	 * @param {ColorSpace|string} options.space - The space whose gamut we want to map to
	 * @param {boolean} options.inPlace - If true, modify the current color, otherwise return a new one.
	 */
	toGamut ({method = Color.defaults.gamutMapping, space = this.space, inPlace} = {}) {
		if (util.isString(arguments[0])) {
			space = arguments[0];
		}

		space = ColorSpace.get(space);

		if (this.inGamut(space, {epsilon: 0})) {
			return this;
		}

		// 3 spaces:
		// this.space: current color space
		// space: space whose gamut we are mapping to
		// mapSpace: space with the coord we're reducing
		let color = this.to(space);

		if (method !== "clip" && !this.inGamut(space)) {
			let clipped = color.toGamut({method: "clip", space});
			if (this.deltaE(clipped, {method: "2000"}) > 2) {
				// Reduce a coordinate of a certain color space until the color is in gamut
				let coordMeta = ColorSpace.resolveCoord(method);
				let mapSpace = coordMeta.space;
				let coordId = coordMeta.id;

				let mappedColor = color.to(mapSpace);
				let bounds = coordMeta.range || coordMeta.refRange;
				let min = bounds[0];
				let ε = .01; // for deltaE
				let low = min;
				let high = mappedColor[coordId];
				while (high - low > ε) {
					let clipped = mappedColor.toGamut({space, method: "clip"});
					let deltaE = mappedColor.deltaE(clipped, {method: "2000"});
					if (deltaE - 2 < ε) {
						low = mappedColor[coordId];
					}
					else {
						high = mappedColor[coordId];
					}

					mappedColor[coordId] = (high + low) / 2;
				}

				color = mappedColor.to(space);
			}
			else {
				color = clipped;
			}

		}

		if (method === "clip" // Dumb coord clipping
		    // finish off smarter gamut mapping with clip to get rid of ε, see #17
		    || !color.inGamut(space, {epsilon: 0})
		) {
			let bounds = Object.values(space.coords).map(c => c.range || []);

			color.coords = color.coords.map((c, i) => {
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

		if (space.id !== this.spaceId) {
			color = color.to(this.space);
		}

		if (inPlace) {
			this.coords = color.coords;
			return this;
		}
		else {
			return color;
		}
	}

	clone () {
		return new Color(this.spaceId, this.coords, this.alpha);
	}

	/**
	 * Convert to color space and return a new color
	 * @param {Object|string} space - Color space object or id
	 * @param {Object} options
	 * @param {boolean} options.inGamut - Whether to force resulting color in gamut
	 * @returns {Color}
	 */
	to (space, {inGamut} = {}) {
		let coords = this.space.to(space, this.coords);

		let color = new Color(space, coords, this.alpha);

		if (inGamut) {
			color.toGamut({inPlace: true});
		}

		return color;
	}

	toJSON () {
		return {
			spaceId: this.spaceId,
			coords: this.coords,
			alpha: this.alpha
		};
	}

	/**
	 * Generic toString() method, outputs a color(spaceId ...coords) function
	 * @param {Object} options
	 * @param {number} options.precision - Significant digits
	 * @param {Function|String|Array} options.serializeCoords - If function, maps all coordinates. Keywords tap to colorspace-specific formats (e.g. "hex")
	 * @param {boolean} options.inGamut - Adjust coordinates to fit in gamut first? [default: false]
	 * @param {string} options.name - Function name [default: color]
	 */
	toString ({
		precision = Color.defaults.precision,
		format = "default", commas,
		inGamut = true,
		name,
		fallback,
		...customOptions
	} = {}) {
		format = this.space.getFormat(format)
		       ?? this.space.getFormat("default")
		       ?? ColorSpace.DEFAULT_FORMAT;

		let ret;

		if (format.type === "custom") {
			let coords = this.getCoords({
				inGamut: inGamut || format.toGamut,
				precision
			});

			ret = format.serialize(coords, this.alpha, customOptions);
		}
		else {
			// Functional syntax
			let coords = this.getCoords({inGamut, precision});

			// Convert NaN to zeros to have a chance at a valid CSS color
			// Also convert -0 to 0
			// This also clones it so we can manipulate it
			coords = coords.map(c => c? c : 0);

			name ||= format.name || "color";

			if (format.coordGrammar) {
				Object.entries(this.space.coords).forEach(([id, coordMeta], i) => {
					// Preferred format for each coord is the first one
					let outputType = format.coordGrammar[i][0];

					let fromRange = coordMeta.range || coordMeta.refRange;
					let toRange = outputType.range, suffix = "";

					// Non-strict equals intentional since outputType could be a string object
					if (outputType == "<percentage>") {
						toRange = [0, 100];
						suffix = "%";
					}
					else if (outputType == "<angle>") {
						suffix = "deg";
					}

					if (fromRange && toRange) {
						coords[i] = util.mapRange(fromRange, toRange, coords[i]);
					}

					coords[i] = util.toPrecision(coords[i], precision);

					if (suffix) {
						coords[i] += suffix;
					}
				});
			}

			let args = [...coords];

			if (name === "color") {
				// If output is a color() function, add colorspace id as first argument
				args.unshift(this.space.cssId);
			}

			let strAlpha = this.alpha < 1? ` ${format.commas? "," : "/"} ${this.alpha}` : "";
			ret = `${name}(${args.join(format.commas? ", " : " ")}${strAlpha})`;
		}

		if (fallback) {
			// Return a CSS string that's actually supported by the current browser
			// Return as a String object, so we can also hang the color object on it
			// in case it's different than this. That way third party code can use that
			// for e.g. computing text color, indicating out of gamut etc

			if (!hasDOM || typeof CSS === "undefined" || CSS.supports("color", ret)) {
				ret = new String(ret);
				ret.color = this;
				return ret;
			}

			let fallbacks = Array.isArray(fallback)? fallback.slice() : Color.defaults.fallbackSpaces;

			for (let i = 0, fallbackSpace; fallbackSpace = fallbacks[i]; i++) {
				if (Color.spaces[fallbackSpace]) {
					let color = this.to(fallbackSpace);
					ret = color.toString({precision});

					if (CSS.supports("color", ret)) {
						ret = new String(ret);
						ret.color = color;
						return ret;
					}
					else if (fallbacks === Color.defaults.fallbackSpaces) {
						// Drop this space from the default fallbacks since it's not supported
						fallbacks.splice(i, 1);
						i--;
					}
				}
			}

			// None of the fallbacks worked, return in the most conservative form possible
			let color = this.to("srgb");
			ret = new String(color.toString());
			ret.color = color;
		}

		return ret;
	}

	equals (color) {
		color = Color.get(color);
		return this.space === color.space
		       && this.alpha === color.alpha
		       && this.coords.every((c, i) => c === color.coords[i]);
	}

	get lightness() {
		console.warn(`color.lightness is deprecated. Please use color.lch.l instead.`);
		return this.get("lch.l");
	}
	get chroma() {
		console.warn(`color.chroma is deprecated. Please use color.lch.c instead.`);
		return this.get("lch.c");
	}
	get hue() {
		console.warn(`color.hue is deprecated. Please use color.lch.h instead.`);
		return this.get("lch.h");
	}

	// CSS color to Color object
	static parse (str) {
		let env = {str};
		Color.hooks.run("parse-start", env);

		if (env.color) {
			return env.color;
		}

		env.parsed = util.parseFunction(env.str);

		if (env.parsed) {
			// Is a functional syntax
			let name = env.parsed.name;

			if (name === "color") {
				// color() function
				let id = env.parsed.args.shift();
				let alpha = env.parsed.rawArgs.indexOf("/") > 0? env.parsed.args.pop() : 1;

				for (let space of ColorSpace.all) {
					let colorSpec = space.formats?.functions?.color;
					if (colorSpec) {
						if (id === colorSpec.id || colorSpec.ids?.includes(id)) {
							// From https://drafts.csswg.org/css-color-4/#color-function
							// If more <number>s or <percentage>s are provided than parameters that the colorspace takes, the excess <number>s at the end are ignored.
							// If less <number>s or <percentage>s are provided than parameters that the colorspace takes, the missing parameters default to 0. (This is particularly convenient for multichannel printers where the additional inks are spot colors or varnishes that most colors on the page won’t use.)
							let argCount = Object.keys(space.coords).length;
							let coords = Array(argCount).fill(0);
							coords.forEach((_, i) => coords[i] = env.parsed.args[i] || 0);

							return {spaceId: space.id, coords, alpha};
						}
					}
				}

				// Not found
				let didYouMean = "";
				if (id in ColorSpace.registry) {
					// Used color space id instead of color() id, these are often different
					let cssId = ColorSpace.registry[id].formats?.functions?.color?.id;
					didYouMean = `Did you mean color(${cssId})?`;
				}
				throw new TypeError(`Cannot parse color(${id}). ` + (didYouMean || "Missing a plugin?"));
			}
			else {
				for (let space of ColorSpace.all) {
					// color space specific function
					if (space.formats.functions?.[name]) {
						let format = space.formats.functions[name];
						let alpha = 1;

						if (format.lastAlpha || util.last(env.parsed.args).alpha) {
							alpha = env.parsed.args.pop();
						}

						let coords = env.parsed.args;

						if (format.coordGrammar) {
							Object.entries(space.coords).forEach(([id, coordMeta], i) => {
								let coordGrammar = format.coordGrammar[i];
								let providedType = coords[i]?.type;

								// Find grammar alternative that matches the provided type
								// Non-strict equals is intentional because we are comparing w/ string objects
								coordGrammar = coordGrammar.find(c => c == providedType);

								// Check that each coord conforms to its grammar
								if (!coordGrammar) {
									// Type does not exist in the grammar, throw
									console.log(coordMeta)
									let coordName = coordMeta.name || id;
									throw new TypeError(`${providedType} not allowed for ${coordName} in ${name}()`);
								}

								let fromRange = coordGrammar.range;

								if (providedType === "<percentage>") {
									fromRange ||= [0, 1];
								}

								let toRange = coordMeta.range || coordMeta.refRange;

								if (fromRange && toRange) {

									coords[i] = util.mapRange(fromRange, toRange, coords[i]);
								}
							});
						}

						return {
							spaceId: space.id,
							coords, alpha
						};
					}
				}
			}
		}
		else {
			// Custom, colorspace-specific format
			for (let space of ColorSpace.all) {
				for (let formatId in space.formats.custom) {
					let format = space.formats.custom[formatId];

					if (format.test && !format.test(env.str)) {
						continue;
					}

					let color = format.parse(env.str);

					if (color) {
						return color;
					}
				}
			}
		}


		// If we're here, we couldn't parse
		throw new TypeError(`Could not parse ${str} as a color. Missing a plugin?`);
	}

	// One-off convert between color spaces
	static convert (coords, fromSpace, toSpace) {
		fromSpace = ColorSpace.get(fromSpace);

		return fromSpace.to(toSpace, coords);
	}

	/**
	 * Get a color from the argument passed
	 * Basically gets us the same result as new Color(color) but doesn't clone an existing color object
	 */
	static get (color, ...args) {
		if (color instanceof Color) {
			return color;
		}

		return new Color(color, ...args);
	}

	/**
	 * Return a color space object from an id or color space object
	 * Mainly used internally, so that functions can easily accept either
	 */
	static space (space) {
		return ColorSpace.get(space);
	}

	// Define static versions of all instance methods
	static statify(names = []) {
		names = names || Object.getOwnPropertyNames(Color.prototype);

		for (let prop of Object.getOwnPropertyNames(Color.prototype)) {
			let descriptor = Object.getOwnPropertyDescriptor(Color.prototype, prop);

			if (descriptor.get || descriptor.set) {
				continue; // avoid accessors
			}

			let method = descriptor.value;

			if (typeof method === "function" && !(prop in Color)) {
				// We have a function, and no static version already
				Color[prop] = function(color, ...args) {
					color = Color.get(color);
					return color[prop](...args);
				};
			}
		}
	}
};

Object.assign(Color, {
	deltaE,
	util,
	hooks,
	WHITES,
	Space: ColorSpace,
	spaces: ColorSpace.registry,

	// Global defaults one may want to configure
	defaults: {
		gamutMapping: "lch.c",
		precision: 5,
		deltaE: "76", // Default deltaE method
		fallbackSpaces: ["p3", "srgb"]
	}
});

// Make static methods for all instance methods
Color.statify();

// Color.DEBUGGING = true;
