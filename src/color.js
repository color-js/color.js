import * as util from "./util.js";
import Hooks from "./hooks.js";

const ε = .000005;

export default class Color {
	// Signatures:
	// new Color(stringToParse)
	// new Color(otherColor)
	// new Color(coords, alpha) // defaults to sRGB
	constructor (spaceId = "sRGB", coords = [0, 0, 0], alpha = 1) {
		if (arguments.length === 1) {
			let color = arguments[0];

			if (util.isString(color)) {
				// Just a string provided, parse
				color = Color.parse(color);

				if (!color) {
					throw new TypeError(`Cannot parse "${arguments[0]}" as a color`);
				}
			}

			if (color) {
				this.spaceId = color.spaceId;
				this.coords = color.coords;
				this.alpha = color.alpha;
			}
		}
		else {
			if (Array.isArray(spaceId)) {
				// No color space provided, default to sRGB
				[spaceId, coords, alpha] = ["sRGB", spaceId, coords];
			}

			this.spaceId = spaceId;
			this.coords = coords;
			this.alpha = alpha;
		}

		this.alpha = this.alpha < 1? this.alpha : 1; // this also deals with NaN etc
	}

	get space () {
		return _.spaces[this.spaceId];
	}

	set space (value) {
		// Setting spaceId works with color space objects too
		return this.spaceId = value;
	}

	get spaceId () {
		return this._spaceId;
	}

	// Handle dynamic changes of color space
	set spaceId (id) {
		let newSpace = _.space(id);

		if (!newSpace) {
			throw new TypeError(`No color space found with id = "${id}"`);
		}

		id = newSpace.id;

		if (this.space && newSpace && this.space !== newSpace) {
			// We’re not setting this for the first time, need to:
			// a) Convert coords
			this.coords = this[id];

			// b) Remove instance properties from previous color space
			for (let prop in this.space.instance) {
				if (this.hasOwnProperty(prop)) {
					delete this[prop];
				}
			}
		}

		this._spaceId = id;

		// Add new instance properties from new color space
		util.extend(this, this.space.instance);
	}

	get white () {
		return this.space.white || _.whites.D50;
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
			let props = prop.split(".");
			let lastProp = props.pop();
			let obj = props.reduceRight((acc, cur) => {
				return acc && acc[cur];
			}, this);

			if (obj) {
				obj[lastProp] = value;
			}
		}

		return this;
	}

	// 1976 DeltaE. 2.3 is the JND
	deltaE (color) {
		color = _.get(color);
		let lab1 = this.lab;
		let lab2 = color.lab;
		return Math.sqrt([0, 1, 2].reduce((a, i) => a + (lab2[i] - lab1[i]) ** 2, 0));
	}

	luminance () {
		return this.Y / this.white[1];
	}

	contrast (color) {
		return (this.luminance + .05) / (color.luminance + .05);
	}

	// Get formatted coords
	getCoords ({inGamut, precision = 5} = {}) {
		let coords = this.coords;

		if (inGamut === true && !this.inGamut()) {
			coords = this.toGamut().coords;
		}

		if (precision !== undefined) {
			let bounds = this.space.coords? Object.values(this.space.coords) : [];

			coords = coords.map((n, i) => util.toPrecision(n, precision, bounds[i]));

		}

		return coords;
	}

	/**
	 * @return {Boolean} Is the color in gamut?
	 */
	inGamut ({space = this.space} = {}) {
		return _.inGamut(space, this.coords);
	}

	static inGamut (space, coords) {
		space = _.space(space);

		if (space.inGamut) {
			return space.inGamut(coords);
		}
		else {
			if (!space.coords) {
				return true;
			}

			// No color-space specific inGamut() function, just check if coords are within reference range
			let bounds = Object.values(space.coords);

			return coords.every((c, i) => {
				let [min, max] = bounds[i];

				return (min === undefined || c >= min - ε)
				    && (max === undefined || c <= max + ε);
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
	toGamut ({method = "lch.chroma", space = this.space, inPlace} = {}) {
		space = _.space(space);

		if (this.inGamut(space)) {
			return this;
		}

		let coords = Color.convert(this.coords, this.space, space);

		if (method.indexOf(".") > 0) {
			// Reduce a coordinate of a certain color space until the color is in gamut
			let [mapSpace, coordName] = util.parseCoord(method);

			let min = mapSpace.coords[coordName][0];
			let i = Object.keys(mapSpace.coords).indexOf(coordName);

			let mapCoords = this[mapSpace.id];

			let low = min;
			let high = mapCoords[i];

			mapCoords[i] /= 2;

			while (high - low > ε) {
				coords = Color.convert(mapCoords, mapSpace, space);

				if (Color.inGamut(space, coords)) {
					low = mapCoords[i];
				}
				else {
					high = mapCoords[i];
				}

				mapCoords[i] = (high + low) / 2;
			}
		}

		if (method === "clip" // Dumb coord clipping
		    // finish off smarter gamut mapping with clip to get rid of ε, see #17
		    || !Color.inGamut(space, coords)
		) {

			let bounds = Object.values(space.coords);

			coords = coords.map((c, i) => {
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

		if (inPlace) {
			this.coords = coords;
			return this;
		}
		else {
			return new Color(this.spaceId, coords, this.alpha);
		}
	}

	/**
	 * Convert to color space and return a new color
	 * @param {Object|string} space - Color space object or id
	 * @param {Object} options
	 * @param {boolean} options.inGamut - Whether to force resulting color in gamut
	 * @returns {Color}
	 */
	to (space, {inGamut} = {}) {
		let id = space;

		if (!util.isString(space)) {
			id = space.id;
		}

		let color = new Color(id, this[id], this.alpha);

		if (inGamut) {
			color.inGamut({inPlace: true});
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
	toString ({precision = 5, format, commas, inGamut, name = "color"} = {}) {
		let strAlpha = this.alpha < 1? ` ${commas? "," : "/"} ${this.alpha}` : "";

		let coords = this.getCoords({inGamut, precision});

		if (util.isString(format)) {
			if (format === "%") {
				format = c => c.toLocaleString("en-US", {style: "percent", maximumSignificantDigits: precision});
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

		return `${name}(${args.join(commas? ", " : " ")}${strAlpha})`;
	}

	// Adapt XYZ from white point W1 to W2
	static chromaticAdaptation (W1, W2, XYZ) {
		W1 = W1 || _.whites.D50;
		W2 = W2 || _.whites.D50;

		if (W1 === W2) {
			return XYZ;
		}

		let M;

		if (W1 === _.whites.D65 && W2 === _.whites.D50) {
			M = [
				[ 1.0478112,  0.0228866, -0.0501270],
				[ 0.0295424,  0.9904844, -0.0170491],
				[-0.0092345,  0.0150436,  0.7521316]
			];
		}
		else if (W1 === _.whites.D50 && W2 === _.whites.D65) {
			M = [
				[ 0.9555766, -0.0230393,  0.0631636],
				[-0.0282895,  1.0099416,  0.0210077],
				[ 0.0122982, -0.0204830,  1.3299098]
			];
		}

		if (M) {
			return util.multiplyMatrices(M, XYZ);
		}
		else {
			throw new TypeError("Only white points D50 and D65 supported for now.");
		}
	}

	// CSS color to Color object
	static parse (str) {
		let parsed = _.parseFunction(str);

		let env = {str, parsed};
		_.hooks.run("parse-start", env);

		if (env.color) {
			return env.color;
		}

		let isRGB = parsed && parsed.name.indexOf("rgb") === 0;

		// Try colorspace-specific parsing
		for (let space of Object.values(_.spaces)) {
			if (space.parse) {
				let color = space.parse(str, parsed);

				if (color) {
					return color;
				}
			}
		}

		if ((!parsed || !isRGB)
		    && typeof document !== "undefined" && document.head // Do we have a DOM?
		) {
			// Use browser to parse when a DOM is available
			// this is how we parse #hex or color names, or RGB transformations like hsl()
			let previousColor = document.head.style.color;
			document.head.style.color = "";
			document.head.style.color = str;

			if (document.head.style.color !== previousColor) {
				let computed = getComputedStyle(document.head).color;
				document.head.style.color = previousColor;

				if (computed) {
					str = computed;
					parsed = _.parseFunction(computed);
				}
			}
		}

		// parsed might have changed, recalculate
		isRGB = parsed && parsed.name.indexOf("rgb") === 0;

		if (parsed) {
			// It's a function
			if (isRGB) {
				let args = parsed.args.map((c, i) => i < 3 && !c.percentage? c / 255 : +c);

				return {
					spaceId: "srgb",
					coords: args.slice(0, 3),
					alpha: args[3]
				};
			}
			else if (parsed.name === "color") {
				let spaceId = parsed.args.shift();
				let space = Object.values(_.spaces).find(space => (space.cssId || space.id) === spaceId);

				if (space) {
					let argCount = Object.keys(space.coords).length;

					return {
						spaceId: space.id,
						coords: parsed.args.slice(0, argCount),
						alpha: parsed.args.slice(argCount)[0]
					};
				}
				else {
					throw new TypeError(`Color space ${spaceId} not found. Missing a plugin?`);
				}
			}
		}
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
				name: parts[1],
				rawArgs: parts[2],
				// An argument could be (as of css-color-4):
				// a number, percentage, degrees (hue), ident (in color())
				args
			};
		}
	}

	// One-off convert between color spaces
	static convert (coords, fromSpace, toSpace) {
		fromSpace = _.space(fromSpace);
		toSpace = _.space(toSpace);

		let fromId = fromSpace.id;

		if (fromSpace === toSpace) {
			// Same space, no change needed
			return coords;
		}

		// Do we have a more specific conversion function?
		// Avoids round-tripping to & from XYZ
		let Id = util.capitalize(fromId);

		if (("from" + Id) in toSpace) {
			// No white point adaptation, we assume the custom function takes care of it
			return space["from" + Id](coords);
		}

		let XYZ = fromSpace.toXYZ(coords);

		if (toSpace.white !== fromSpace.white) {
			// Different white point, perform white point adaptation
			XYZ = _.chromaticAdaptation(fromSpace.white, toSpace.white, XYZ);
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
			return _.spaces[space.toLowerCase()];
		}
		else if (type === "object") {
			return space;
		}
		// ISSUE else throw?
	}

	// Define a new color space
	static defineSpace ({id, inherits}) {
		let space = _.spaces[id] = arguments[0];

		if (inherits) {
			const except = ["id", "parse", "instance", "properties"];
			let parent = _.spaces[inherits];

			for (let prop in parent) {
				if (!except.includes(prop) && !(prop in space)) {
					util.copyDescriptor(space, parent, prop);
				}
			}
		}

		let coords = space.coords;

		if (space.properties) {
			util.extend(_.prototype, space.properties);
		}

		if (!space.fromXYZ && !space.toXYZ) {
			// Using a different connection space, define from/to XYZ functions based on that

			// What are we using as a connection space?
			for (let prop in space) {
				if (typeof space[prop] === "function") {
					// Is the name of the form fromXxx or toXxx?
					let Id = (prop.match(/^(?:from|to)([A-Z][a-zA-Z]+$)/) || [])[1];

					if (Id && ("from" + Id) in space && ("to" + Id) in space) {
						// This is a conversion function AND we have both from & to!
						let space = _.spaces[Id.toLowerCase()];

						if (space) {
							// var used intentionally
							var connectionSpace = space;
							var fromConnection = "from" + Id;
							var toConnection = "to" + Id;
							break;
						}
					}
				}
			}

			if (connectionSpace) {
				// Define from/to XYZ functions based on the connection space

				if (!connectionSpace.toXYZ || !connectionSpace.fromXYZ) {
					throw new ReferenceError(`Connection space ${connectionSpace.name} for ${space.name} has no toXYZ()/fromXYZ() functions.`);
				}

				Object.assign(space, {
					// ISSUE do we need white point adaptation here?
					fromXYZ(XYZ) {
						let newCoords = connectionSpace.fromXYZ(XYZ);
						return this[fromConnection](newCoords);
					},
					toXYZ(coords) {
						let newCoords = this[toConnection](coords);
						return connectionSpace.toXYZ(newCoords);
					}
				});
			}
			else {
				throw new ReferenceError(`No connection space found for ${space.name}.`);
			}
		}

		// Define getters and setters for color.spaceId
		// e.g. color.lch on *any* color gives us the lch coords
		Object.defineProperty(_.prototype, id, {
			// Convert coords to coords in another colorspace and return them
			// Source colorspace: this.spaceId
			// Target colorspace: id
			get() {
				return _.convert(this.coords, this.spaceId, id);
			},
			// Convert coords in another colorspace to internal coords and set them
			// Target colorspace: this.spaceId
			// Source colorspace: id
			set(coords) {
				this.coords = _.convert(coords, id, this.spaceId);
			},
			configurable: true,
			enumerable: true
		});

		_.defineCoordAccessors(id, Object.keys(coords));

		return space;
	}

	static defineCoordAccessors(id, coordNames) {
		let clashes = coordNames.some(coord => coord in _.prototype);

		coordNames.forEach((coord, i) => {
			let prop = clashes? id + "_" + coord : coord;

			Object.defineProperty(_.prototype, prop, {
				get() {
					if (coord in this.space.coords) {
						return this.coords[i];
					}
					else {
						return this[id][i];
					}
				},
				set(value) {
					let coords = this[id];
					coords[i] = value;
					this[id] = coords;
				},
				configurable: true,
				enumerable: true
			});
		});
	}

	// Define static versions of all instance methods
	static statify(names = []) {
		names = names || Object.getOwnPropertyNames(_.prototype);

		for (let prop of Object.getOwnPropertyNames(_.prototype)) {
			let descriptor = Object.getOwnPropertyDescriptor(_.prototype, prop);

			if (descriptor.get || descriptor.set) {
				continue; // avoid accessors
			}

			let method = descriptor.value;

			if (typeof method === "function" && !(prop in _)) {
				// We have a function, and no static version already
				_[prop] = function(color, ...args) {
					color = _.get(color);
					return color[prop](...args);
				};
			}
		}
	}
};

let _  = Color;

_.util = util;
_.hooks = new Hooks();

_.whites = {
	D50: [0.96422, 1.00000, 0.82521],
	D65: [0.95047, 1.00000, 1.08883],
};

_.spaces = {};

_.defineSpace({
	id: "xyz",
	name: "XYZ",
	coords: {
		X: [],
		Y: [],
		Z: []
	},
	toXYZ: coords => coords,
	fromXYZ: coords => coords
});

_.statify();

export {util};
