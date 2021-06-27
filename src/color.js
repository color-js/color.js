import * as util from "./util.js";
import Hooks from "./hooks.js";

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

		if (color) {
			if ("spaceId" in color) {
				this.spaceId = color.spaceId;
			}
			else {
				this.space = color.space;
			}

			this.coords = color.coords.slice();
			this.alpha = color.alpha;
		}
		else { // default signature new Color([ColorSpace,] array [, alpha])
			let spaceId, coords, alpha;

			if (Array.isArray(args[0])) {
				// No color space provided, default to sRGB
				[spaceId, coords, alpha] = ["sRGB", ...args];
			}
			else {
				[spaceId, coords, alpha] = args;
			}

			this.spaceId = spaceId || "sRGB";
			this.coords = coords? coords.slice() : [0, 0, 0];
			this.alpha = alpha;
		}

		this.alpha = this.alpha < 1? this.alpha : 1; // this also deals with NaN etc

		// Convert "NaN" to NaN
		for (let i = 0; i < this.coords.length; i++) {
			if (this.coords[i] === "NaN") {
				this.coords[i] = NaN;
			}
		}
	}

	get space () {
		return Color.spaces[this.spaceId];
	}

	set space (value) {
		// Setting spaceId works with color space objects too
		this.spaceId = value;
	}

	get spaceId () {
		return this._spaceId;
	}

	// Handle dynamic changes of color space
	set spaceId (id) {
		let newSpace = Color.space(id);

		id = newSpace.id;

		if (this.space && newSpace && this.space !== newSpace) {
			// We’re not setting this for the first time, need to:
			// a) Convert coords
			this.coords = this[id];

			// b) Remove instance properties from previous color space
			for (let prop in this.space.instance) {
				if (Object.prototype.hasOwnProperty.call(prop)) {
					delete this[prop];
				}
			}
		}

		this._spaceId = id;

		// Add new instance properties from new color space
		util.extend(this, this.space.instance);
	}

	get white () {
		return this.space.white || Color.whites.D50;
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
		space = Color.space(space);

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
		// Luminance should actually be retrieved from XYZ with a D65 white point.
		return Color.chromaticAdaptation(Color.spaces.xyz.white, Color.whites.D65, this.xyz)[1];
	}

	set luminance (value) {
		let xyz = Color.chromaticAdaptation(Color.spaces.xyz.white, Color.whites.D65, this.xyz);
		xyz[1] = value;
		xyz = Color.chromaticAdaptation(Color.whites.D65, Color.spaces.xyz.white, xyz);
		this.xyz.X = xyz[0];
		this.xyz.Y = xyz[1];
		this.xyz.Z = xyz[2];
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
			let bounds = this.space.coords? Object.values(this.space.coords) : [];

			coords = coords.map((n, i) => util.toPrecision(n, precision, bounds[i]));
		}

		return coords;
	}

	/**
	 * @return {Boolean} Is the color in gamut?
	 */
	inGamut (space = this.space, options = {}) {
		space = Color.space(space);
		return Color.inGamut(space, this[space.id], options);
	}

	static inGamut (space, coords, {epsilon = ε} = {}) {
		space = Color.space(space);

		if (space.inGamut) {
			return space.inGamut(coords, epsilon);
		}
		else {
			if (!space.coords) {
				return true;
			}

			// No color-space specific inGamut() function, just check if coords are within reference range
			let bounds = Object.values(space.coords);

			return coords.every((c, i) => {
				if (Number.isNaN(c)) {
					return true;
				}

				let [min, max] = bounds[i];

				return (min === undefined || c >= min - epsilon)
				    && (max === undefined || c <= max + epsilon);
			});
		}
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

		space = Color.space(space);

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
				let [mapSpace, coordName] = util.parseCoord(method);

				let mappedColor = color.to(mapSpace);
				let bounds = mapSpace.coords[coordName];
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
			let bounds = Object.values(space.coords);

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
		space = Color.space(space);
		let id = space.id;

		let color = new Color(id, this[id], this.alpha);

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
	 * @param {boolean} options.commas - Whether to use commas to separate arguments or spaces (and a slash for alpha) [default: false]
	 * @param {Function|String|Array} options.format - If function, maps all coordinates. Keywords tap to colorspace-specific formats (e.g. "hex")
	 * @param {boolean} options.inGamut - Adjust coordinates to fit in gamut first? [default: false]
	 * @param {string} options.name - Function name [default: color]
	 */
	toString ({
		precision = Color.defaults.precision,
		format, commas, inGamut,
		name = "color",
		fallback
	} = {}) {
		let strAlpha = this.alpha < 1? ` ${commas? "," : "/"} ${this.alpha}` : "";

		let coords = this.getCoords({inGamut, precision});

		// Convert NaN to zeros to have a chance at a valid CSS color
		// Also convert -0 to 0
		coords = coords.map(c => c? c : 0);

		if (util.isString(format)) {
			if (format === "%") {
				format = c => {
					c *= 100;
					return util.toPrecision(c, precision) + "%";
				};
			}
		}

		if (typeof format === "function") {
			coords = coords.map(format);
		}

		let args = [...coords];

		if (name === "color") {
			// If output is a color() function, add colorspace id as first argument
			args.unshift(this.space? this.space.cssId || this.space.id : "XYZ");
		}

		let ret = `${name}(${args.join(commas? ", " : " ")}${strAlpha})`;

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

			for (let i = 0; fallbacks[i]; i++) {
				let fallbackSpace = fallbacks[i];
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
			ret = new String(color.toString({commas: true}));
			ret.color = color;
		}

		return ret;
	}

	equals (color) {
		color = Color.get(color);
		return this.spaceId === color.spaceId
		       && this.alpha === color.alpha
		       && this.coords.every((c, i) => c === color.coords[i]);
	}

	// Adapt XYZ from white point W1 to W2
	static chromaticAdaptation (W1, W2, XYZ, options = {}) {
		W1 = W1 || Color.whites.D50;
		W2 = W2 || Color.whites.D50;

		if (W1 === W2) {
			return XYZ;
		}

		let env = {W1, W2, XYZ, options};

		Color.hooks.run("chromatic-adaptation-start", env);

		if (!env.M) {
			if (env.W1 === Color.whites.D65 && env.W2 === Color.whites.D50) {
				// Linear Bradford CAT
				// env.M = [
				// 	[ 1.0478112,  0.0228866, -0.0501270],
				// 	[ 0.0295424,  0.9904844, -0.0170491],
				// 	[-0.0092345,  0.0150436,  0.7521316]
				// ];

				env.M = [
					[  1.0479298208405488,    0.022946793341019088,  -0.05019222954313557 ],
					[  0.029627815688159344,  0.990434484573249,     -0.01707382502938514 ],
					[ -0.009243058152591178,  0.015055144896577895,   0.7518742899580008  ]
				];
			}
			else if (env.W1 === Color.whites.D50 && env.W2 === Color.whites.D65) {
				// env.M = [
				// 	[ 0.9555766, -0.0230393,  0.0631636],
				// 	[-0.0282895,  1.0099416,  0.0210077],
				// 	[ 0.0122982, -0.0204830,  1.3299098]
				// ];

				env.M = [
					[  0.9554734527042182,   -0.023098536874261423,  0.0632593086610217   ],
					[ -0.028369706963208136,  1.0099954580058226,    0.021041398966943008 ],
					[  0.012314001688319899, -0.020507696433477912,  1.3303659366080753   ]
				];
			}
		}

		Color.hooks.run("chromatic-adaptation-end", env);

		if (env.M) {
			return util.multiplyMatrices(env.M, env.XYZ);
		}
		else {
			throw new TypeError("Only Bradford CAT with white points D50 and D65 supported for now.");
		}
	}

	// CSS color to Color object
	static parse (str) {
		let env = {str};
		Color.hooks.run("parse-start", env);

		if (env.color) {
			return env.color;
		}

		env.parsed = Color.parseFunction(env.str);
		Color.hooks.run("parse-function-start", env);

		if (env.color) {
			return env.color;
		}

		// Try colorspace-specific parsing
		for (let space of Object.values(Color.spaces)) {
			if (space.parse) {
				let color = space.parse(env.str, env.parsed);

				if (color) {
					return color;
				}
			}
		}

		let name = env.parsed && env.parsed.name;

		if (!/^color|^rgb/.test(name) && hasDOM && document.head) {
			// Use browser to parse when a DOM is available
			// we mainly use this for color names right now if keywords.js is not included
			// and for future-proofing

			let previousColor = document.head.style.color;
			document.head.style.color = "";
			document.head.style.color = str;

			if (document.head.style.color !== previousColor) {
				let computed = getComputedStyle(document.head).color;
				document.head.style.color = previousColor;

				if (computed) {
					str = computed;
					env.parsed = Color.parseFunction(computed);
					name = env.parsed.name;
				}
			}
		}

		if (env.parsed) {
			// It's a function
			if (name === "rgb" || name === "rgba") {
				let args = env.parsed.args.map((c, i) => i < 3 && !c.percentage? c / 255 : +c);

				return {
					spaceId: "srgb",
					coords: args.slice(0, 3),
					alpha: args[3]
				};
			}
			else if (name === "color") {
				let spaceId = env.parsed.args.shift().toLowerCase();
				let space = Object.values(Color.spaces).find(space => (space.cssId || space.id) === spaceId);

				if (space) {
					// From https://drafts.csswg.org/css-color-4/#color-function
					// If more <number>s or <percentage>s are provided than parameters that the colorspace takes, the excess <number>s at the end are ignored.
					// If less <number>s or <percentage>s are provided than parameters that the colorspace takes, the missing parameters default to 0. (This is particularly convenient for multichannel printers where the additional inks are spot colors or varnishes that most colors on the page won’t use.)
					let argCount = Object.keys(space.coords).length;
					let alpha = env.parsed.rawArgs.indexOf("/") > 0? env.parsed.args.pop() : 1;
					let coords = Array(argCount).fill(0);
					coords.forEach((_, i) => coords[i] = env.parsed.args[i] || 0);

					return {spaceId: space.id, coords, alpha};
				}
				else {
					throw new TypeError(`Color space ${spaceId} not found. Missing a plugin?`);
				}
			}
		}

		throw new TypeError(`Could not parse ${str} as a color. Missing a plugin?`);
	}

	/**
	 * Parse a CSS function, regardless of its name and arguments
	 * @param String str String to parse
	 * @return Object An object with {name, args, rawArgs}
	 */
	static parseFunction (str) {
		if (!str) {
			return;
		}

		str = str.trim();

		const isFunctionRegex = /^([a-z]+)\((.+?)\)$/i;
		const isNumberRegex = /^-?[\d.]+$/;
		let parts = str.match(isFunctionRegex);

		if (parts) {
			// It is a function, parse args
			let args = parts[2].match(/([-\w.]+(?:%|deg)?)/g);

			args = args.map(arg => {
				if (/%$/.test(arg)) {
					// Convert percentages to 0-1 numbers
					let n = new Number(+arg.slice(0, -1) / 100);
					n.percentage = true;
					return n;
				}
				else if (/deg$/.test(arg)) {
					// Drop deg from degrees and convert to number
					let n = new Number(+arg.slice(0, -3));
					n.deg = true;
					return n;
				}
				else if (isNumberRegex.test(arg)) {
					// Convert numerical args to numbers
					return +arg;
				}

				// Return everything else as-is
				return arg;
			});

			return {
				name: parts[1].toLowerCase(),
				rawName: parts[1],
				rawArgs: parts[2],
				// An argument could be (as of css-color-4):
				// a number, percentage, degrees (hue), ident (in color())
				args
			};
		}
	}

	// One-off convert between color spaces
	static convert (coords, fromSpace, toSpace) {
		fromSpace = Color.space(fromSpace);
		toSpace = Color.space(toSpace);

		if (fromSpace === toSpace) {
			// Same space, no change needed
			return coords;
		}

		// Convert NaN to 0, which seems to be valid in every coordinate of every color space
		coords = coords.map(c => Number.isNaN(c)? 0 : c);

		let fromId = fromSpace.id;
		let toId = toSpace.id;

		// Do we have a more specific conversion function?
		// Avoids round-tripping to & from XYZ
		if (toSpace.from && toSpace.from[fromId]) {
			// No white point adaptation, we assume the custom function takes care of it
			return toSpace.from[fromId](coords);
		}

		if (fromSpace.to && fromSpace.to[toId]) {
			// No white point adaptation, we assume the custom function takes care of it
			return fromSpace.to[toId](coords);
		}

		let XYZ = fromSpace.toXYZ(coords);

		if (toSpace.white !== fromSpace.white) {
			// Different white point, perform white point adaptation
			XYZ = Color.chromaticAdaptation(fromSpace.white, toSpace.white, XYZ);
		}

		return toSpace.fromXYZ(XYZ);
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
		let type = util.type(space);

		if (type === "string") {
			// It's a color space id
			let ret = Color.spaces[space.toLowerCase()];

			if (!ret) {
				throw new TypeError(`No color space found with id = "${space}"`);
			}

			return ret;
		}
		else if (space && type === "object") {
			return space;
		}

		throw new TypeError(`${space} is not a valid color space`);
	}

	// Define a new color space
	static defineSpace ({id, inherits}) {
		let space = Color.spaces[id] = arguments[0];

		if (inherits) {
			const except = ["id", "parse", "instance", "properties"];
			let parent = Color.spaces[inherits];

			for (let prop in parent) {
				if (!except.includes(prop) && !(prop in space)) {
					util.copyDescriptor(space, parent, prop);
				}
			}
		}

		let coords = space.coords;

		if (space.properties) {
			util.extend(Color.prototype, space.properties);
		}

		if (!space.fromXYZ && !space.toXYZ) {
			// Using a different connection space, define from/to XYZ functions based on that
			let connectionSpace;

			// What are we using as a connection space?
			if (space.from && space.to) {
				let from = new Set(Object.keys(space.from));
				let to = new Set(Object.keys(space.to));

				// Find spaces we can both convert to and from
				let candidates = [...from].filter(id => {
					if (to.has(id)) {
						// Of those, only keep those that have fromXYZ and toXYZ
						let space = Color.spaces[id];
						return space && space.fromXYZ && space.toXYZ;
					}
				});

				if (candidates.length > 0) {
					// Great, we found connection spaces! Pick the first one
					connectionSpace = Color.spaces[candidates[0]];
				}
			}

			if (connectionSpace) {
				// Define from/to XYZ functions based on the connection space
				Object.assign(space, {
					// ISSUE do we need white point adaptation here?
					fromXYZ(XYZ) {
						let newCoords = connectionSpace.fromXYZ(XYZ);
						return this.from[connectionSpace.id](newCoords);
					},
					toXYZ(coords) {
						let newCoords = this.to[connectionSpace.id](coords);
						return connectionSpace.toXYZ(newCoords);
					}
				});
			}
			else {
				throw new ReferenceError(`No connection space found for ${space.name}.`);
			}
		}

		let coordNames = Object.keys(coords);

		// Define getters and setters for color[spaceId]
		// e.g. color.lch on *any* color gives us the lch coords
		Object.defineProperty(Color.prototype, id, {
			// Convert coords to coords in another colorspace and return them
			// Source colorspace: this.spaceId
			// Target colorspace: id
			get () {
				let ret = Color.convert(this.coords, this.spaceId, id);

				if (typeof Proxy === "undefined") {
					// If proxies are not supported, just return a static array
					return ret;
				}

				// Enable color.spaceId.coordName syntax
				return new Proxy(ret, {
					has: (obj, property) => {
						return coordNames.includes(property) || Reflect.has(obj, property);
					},
					get: (obj, property, receiver) => {
						let i = coordNames.indexOf(property);

						if (i > -1) {
							return obj[i];
						}

						return Reflect.get(obj, property, receiver);
					},
					set: (obj, property, value, receiver) => {
						let i = coordNames.indexOf(property);

						if (property > -1) { // Is property a numerical index?
							i = property; // next if will take care of modifying the color
						}

						if (i > -1) {
							obj[i] = value;

							// Update color.coords
							this.coords = Color.convert(obj, id, this.spaceId);

							return true;
						}

						return Reflect.set(obj, property, value, receiver);
					},

				});
			},
			// Convert coords in another colorspace to internal coords and set them
			// Target colorspace: this.spaceId
			// Source colorspace: id
			set (coords) {
				this.coords = Color.convert(coords, id, this.spaceId);
			},
			configurable: true,
			enumerable: true
		});

		return space;
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
				util.value(this, Color.shortcuts[prop], value);
			},
			configurable: true,
			enumerable: true
		});
	}

	// Define static versions of all instance methods
	static statify(names = []) {
		names = names || Object.getOwnPropertyNames(Color.prototype);

		for (let prop of names) {
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
}

Object.assign(Color, {
	util,
	hooks: new Hooks(),
	whites: {
		// from ASTM E308-01
		// D50: [0.96422, 1.00000, 0.82521],
		// D65: [0.95047, 1.00000, 1.08883],
		// for compatibility, the four-digit chromaticity-derived ones everyone else uses
		D50: [0.3457 / 0.3585, 1.00000, (1.0 - 0.3457 - 0.3585) / 0.3585],
		D65: [0.3127 / 0.3290, 1.00000, (1.0 - 0.3127 - 0.3290) / 0.3290],

	},
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

Color.defineSpace({
	id: "xyz",
	name: "XYZ",
	coords: {
		X: [],
		Y: [],
		Z: []
	},
	white: Color.whites.D50,
	inGamut: _coords => true,
	toXYZ: coords => coords,
	fromXYZ: coords => coords
});

for (let prop in Color.shortcuts) {
	Color.defineShortcut(prop);
}

// Make static methods for all instance methods
Color.statify();

export {util};

// Color.DEBUGGING = true;
