import * as util from "./util.js";
import hooks from "./hooks.js";
import defaults from "./defaults.js";
import ColorSpace from "./space.js";
import {WHITES} from "./adapt.js";
import {deltaE} from "./deltaE.js";
import parse from "./parse.js";
import toString from "./toString.js";
import toGamut from "./toGamut.js";

import xyz_d65 from "./spaces/xyz-d65.js";
import "./spaces/xyz-d50.js";
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

		if (args.length === 1) {
			// new Color(string)
			if (util.isString(args[0])) {
				str = args[0];
				color = parse(args[0]);
			}
			// new Color(color)
			// new Color({spaceId, coords})
			// new Color({space, coords})
			else if (typeof args[0] === "object") {
				color = args[0];
			}
		}

		let space, coords, alpha;

		if (color) {
			space = color.space || color.spaceId;
			coords = color.coords;
			alpha = color.alpha;
		}
		else {
			// default signature new Color(ColorSpace, array [, alpha])
			[space, coords, alpha] = args;
		}

		this.#space = ColorSpace.get(space);
		this.coords = coords? coords.slice() : [0, 0, 0];
		this.alpha = alpha < 1? alpha : 1; // this also deals with NaN etc

		// Convert "NaN" to NaN
		for (let i = 0; i < this.coords.length; i++) {
			if (this.coords[i] === "NaN") {
				this.coords[i] = NaN;
			}
		}

		// Define getters and setters for each coordinate
		for (let id in this.#space.coords) {
			Object.defineProperty(this, id, {
				get: () => this.get(id),
				set: value => this.set(id, value)
			});
		}
	}

	#space

	get space() {
		return this.#space;
	}

	get spaceId() {
		return this.#space.id;
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

	deltaE (...args) {
		return deltaE(this, ...args);
	}

	// Relative luminance
	get luminance () {
		return this.get([xyz_d65, "y"]);
	}

	set luminance (value) {
		this.set([xyz_d65, "y"], value);
	}

	// Chromaticity coordinates
	get uv () {
		let [X, Y, Z] = this.getAll(xyz_d65);
		let denom = X + 15 * Y + 3 * Z;
		return [4 * X / denom, 9 * Y / denom];
	}

	get xy () {
		let [X, Y, Z] = this.getAll(xyz_d65);
		let  sum = X + Y + Z;
		return [X / sum, Y / sum];
	}
	// no setters, as lightness information is lost
	// when converting color to chromaticity

	/**
	 * @return {Boolean} Is the color in gamut?
	 */
	inGamut (space = this.space, {epsilon = ε} = {}) {
		space = ColorSpace.get(space);
		let coords = this.coords;

		if (space !== this.space) {
			coords = this.space.to(space, this.coords);
		}

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
