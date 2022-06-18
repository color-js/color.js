import * as util from "./util.js";
import hooks from "./hooks.js";
import ColorSpace from "./space.js";
import {WHITES} from "./adapt.js";

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

		if (space) {
			this.#space = space;
		}
		else if (spaceId) {
			this.#space = ColorSpace.get(spaceId);
		}

		this.#space = this.#space ?? ColorSpace.get("srgb");
		this.coords = coords? coords.slice() : [0, 0, 0];
		this.alpha = alpha < 1? alpha : 1; // this also deals with NaN etc

		// Convert "NaN" to NaN
		for (let i = 0; i < this.coords.length; i++) {
			if (this.coords[i] === "NaN") {
				this.coords[i] = NaN;
			}
		}

	#space;
	get space () {
		return this.#space;
	}

	get spaceId () {
		return this.space.id;
	}

	get white () {
		return this.space.white;
	}

	get (prop) {
		return util.value(this, prop);
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
				let current = util.value(this, prop);

				util.value(this, prop, value.call(this, current));
			}
			else {
				util.value(this, prop, value);
			}

		}

		return this;
	}

	lighten (amount = .25) {
		let ret = new Color(this);
		let lightness = ret.lightness;
		ret.lightness = lightness * (1 + amount);

		return ret;
	}

	darken (amount = .25) {
		let ret = new Color(this);
		let lightness = ret.lightness;
		ret.lightness = lightness * (1 - amount);

		return ret;
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

	deltaE (color, o = {}) {
		if (util.isString(o)) {
			o = {method: o};
		}

		let {method = Color.defaults.deltaE, ...rest} = o;
		color = Color.get(color);

		if (this["deltaE" + method]) {
			return this["deltaE" + method](color, rest);
		}

		return this.deltaE76(color);
	}

	// 1976 DeltaE. 2.3 is the JND
	deltaE76 (color) {
		return this.distance(color, "lab");
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

		if (method.indexOf(".") > 0 && !this.inGamut(space)) {
			let clipped = color.toGamut({method: "clip", space});
			if (this.deltaE(clipped, {method: "2000"}) > 2) {
				// Reduce a coordinate of a certain color space until the color is in gamut
				let [mapSpace, coordName] = parseCoord(method);

				let mappedColor = color.to(mapSpace);
				let bounds = mapSpace.coords[coordName].range || mapSpace.coords[coordName].refRange;
				let min = bounds[0];
				let ε = .01; // for deltaE
				let low = min;
				let high = mappedColor[coordName];
				while (high - low > ε) {
					let clipped = mappedColor.toGamut({space, method: "clip"});
					let deltaE = mappedColor.deltaE(clipped, {method: "2000"});
					if (deltaE - 2 < ε) {
						low = mappedColor[coordName];
					}
					else {
						high = mappedColor[coordName];
					}

					mappedColor[coordName] = (high + low) / 2;
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
			coords = coords.map(c => c? c : 0);

			name ||= format.name || "color";

			if (format.coordsOut) {
				coords = format.coordsOut(coords);
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
				let cssId = env.parsed.args.shift();
				let alpha = env.parsed.rawArgs.indexOf("/") > 0? env.parsed.args.pop() : 1;

				for (let space of ColorSpace.all) {
					if (cssId === space.cssId) {
						// From https://drafts.csswg.org/css-color-4/#color-function
						// If more <number>s or <percentage>s are provided than parameters that the colorspace takes, the excess <number>s at the end are ignored.
						// If less <number>s or <percentage>s are provided than parameters that the colorspace takes, the missing parameters default to 0. (This is particularly convenient for multichannel printers where the additional inks are spot colors or varnishes that most colors on the page won’t use.)
						let argCount = Object.keys(space.coords).length;
						let coords = Array(argCount).fill(0);
						coords.forEach((_, i) => coords[i] = env.parsed.args[i] || 0);

						return {spaceId: space.id, coords, alpha};
					}
				}

				// Not found
				throw new TypeError(`Color space ${env.parsed.args[0]} not found. Missing a plugin?`);
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

						if (format.coordsIn) {
							coords = format.coordsIn(coords);
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

	// Define a shortcut property, e.g. color.lightness instead of color.lch.lightness
	// Shorcut is looked up on Color.shortcuts at calling time
	// If `long` is provided, it's added to Color.shortcuts as well, otherwise it's assumed to be already there
	static defineShortcut(prop, obj = Color.prototype, long) {
		if (long) {
			Color.shortcuts[prop] = long;
		}

		Object.defineProperty(obj, prop, {
			get () {
				return util.value(this, Color.shortcuts[prop]);
			},
			set (value) {
				return util.value(this, Color.shortcuts[prop], value);
			},
			configurable: true,
			enumerable: true
		});
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
	util,
	hooks,
	WHITES,
	spaces: {},

	// These will be available as getters and setters on EVERY color instance.
	// They refer to LCH by default, but can be set to anything
	// and you can add more by calling Color.defineShortcut()
	shortcuts: {
		"lightness": "lch.lightness",
		"chroma": "lch.chroma",
		"hue": "lch.hue",
	},

	// Global defaults one may want to configure
	defaults: {
		gamutMapping: "lch.chroma",
		precision: 5,
		deltaE: "76", // Default deltaE method
		fallbackSpaces: ["p3", "srgb"]
	}
});

for (let prop in Color.shortcuts) {
	Color.defineShortcut(prop);
}

// Make static methods for all instance methods
Color.statify();

// Private helpers
function parseCoord(coord) {
	if (coord.indexOf(".") > 0) {
		// Reduce a coordinate of a certain color space until the color is in gamut
		let [spaceId, coordName] = coord.split(".");
		let space = ColorSpace.get(spaceId);

		if (!(coordName in space.coords)) {
			throw new ReferenceError(`Color space "${space.name}" has no "${coordName}" coordinate.`);
		}

		return [space, coordName];
	}
}

// Color.DEBUGGING = true;
