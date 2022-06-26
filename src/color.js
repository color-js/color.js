import * as util from "./util.js";
import hooks from "./hooks.js";
import defaults from "./defaults.js";
import ColorSpace from "./space.js";
import {WHITES} from "./adapt.js";
import {deltaE} from "./deltaE.js";
import parse from "./parse.js";
import toString from "./toString.js";
import toGamut from "./toGamut.js";

import "./spaces/xyz-d50.js";
import "./spaces/xyz-d65.js";
import "./spaces/srgb.js";

const ε = .000075;
const hasDOM = typeof document !== "undefined";

/**
 * Class that represents a color
 */
export default class Color {
	/**
	 * Creates an instance of Color.
	 * Signatures:
	 * - `new Color(stringToParse)`
	 * - `new Color(otherColor)`
	 * - `new Color(coords, alpha)` // defaults to sRGB
	 * - `new Color(CSS variable [, root])`
	 */
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
				color = parse(str);
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

	/**
	 * Get the coordinates of this color in another color space
	 *
	 * @param {string | ColorSpace} space
	 * @returns {number[]}
	 */
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
		return this.get("xyz.y");
	}

	set luminance (value) {
		this.set("xyz.y", value);
	}

	// Chromaticity coordinates
	get uv () {
		let [X, Y, Z] = this.getAll("xyz");
		let denom = X + 15 * Y + 3 * Z;
		return [4 * X / denom, 9 * Y / denom];
	}

	get xy () {
		let [X, Y, Z] = this.getAll("xyz");
		let  sum = X + Y + Z;
		return [X / sum, Y / sum];
	}
	// no setters, as lightness information is lost
	// when converting color to chromaticity

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

	toGamut (...args) {
		return toGamut(this, ...args);
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
			color.toGamut();
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

	toString (...args) {
		return toString(this, ...args);
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
	parse,

	// Global defaults one may want to configure
	defaults
});

if (typeof CSS !== "undefined" && CSS.supports) {
	// Find widest supported color space for CSS
	for (let spaceId of ["lab", "rec2020", "p3", "srgb"]) {
		if (spaceId in ColorSpace.registry) {
			let coords = ColorSpace.registry[spaceId].getMinCoords();
			let color = new Color(spaceId, coords);

			if (CSS.supports("color", color)) {
				defaults.css_space = spaceId;
			}
		}
	}
}

// Make static methods for all instance methods
Color.statify();

// Color.DEBUGGING = true;
