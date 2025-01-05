/**
 * @packageDocumentation
 * @class Color
 * Class that represents a single color.
 * All of Color.js’s tree-shakeable methods are also available as instance methods on this class,
 * as well as static methods that take the color as the first argument.
 */

import * as util from "./util.js";
import hooks from "./hooks.js";
import defaults from "./defaults.js";
import ColorSpace from "./ColorSpace.js";
import {WHITES} from "./adapt.js";
import {
	getColor,
	parse,
	to,
	serialize,
	inGamut,
	toGamut,
	distance,
	deltas,
	equals,
	get,
	getAll,
	set,
	setAll,
	display,
} from "./index-fn.js";


import "./spaces/xyz-d50.js";
import "./spaces/srgb.js";

export default class Color {
	/**
	 * Creates an instance of Color.
	 * Signatures:
	 * - `new Color(stringToParse)`
	 * - `new Color(otherColor)`
	 * - `new Color({space, coords, alpha})`
	 * - `new Color(space, coords, alpha)`
	 * - `new Color(spaceId, coords, alpha)`
	 */
	constructor (...args) {
		let color;

		if (args.length === 1) {
			let parseMeta = {};
			// Clone simple objects to avoid mutating original in getColor
			if (typeof args[0] === "object" && Object.getPrototypeOf(args[0]).constructor === Object) {
				args[0] = { ...args[0] };
			}
			color = getColor(args[0], {parseMeta});

			if (parseMeta.format) {
				// Color actually came from a string
				this.parseMeta = parseMeta;
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

		Object.defineProperty(this, "space", {
			value: ColorSpace.get(space),
			writable: false,
			enumerable: true,
			configurable: true, // see note in https://262.ecma-international.org/8.0/#sec-proxy-object-internal-methods-and-internal-slots-get-p-receiver
		});

		this.coords = coords ? coords.slice() : [0, 0, 0];

		// Clamp alpha to [0, 1]
		this.alpha = util.isNone(alpha) ? alpha : alpha === undefined ? 1 : util.clamp(0, alpha, 1);

		// Define getters and setters for each coordinate
		for (let id in this.space.coords) {
			Object.defineProperty(this, id, {
				get: () => this.get(id),
				set: value => {
					this.set(id, value);
				},
			});
		}
	}

	get spaceId () {
		return this.space.id;
	}

	clone () {
		return new Color(this.space, this.coords, this.alpha);
	}

	toJSON () {
		return {
			spaceId: this.spaceId,
			coords: this.coords,
			alpha: this.alpha,
		};
	}

	display (...args) {
		let ret = display(this, ...args);

		// Convert color object to Color instance
		ret.color = new Color(ret.color);

		return ret;
	}

	/**
	 * Get a color from the argument passed
	 * Basically gets us the same result as new Color(color) but doesn't clone an existing color object
	 */
	static get (color, ...args) {
		if (util.isInstance(color, this)) {
			return color;
		}

		return new Color(color, ...args);
	}

	static defineFunction (name, code, o = code) {
		let {instance = true, returns} = o;

		let func = function (...args) {
			let ret = code(...args);

			if (returns === "color") {
				ret = Color.get(ret);
			}
			else if (returns === "function<color>") {
				let f = ret;
				ret = function (...args) {
					let ret = f(...args);
					return Color.get(ret);
				};
				// Copy any function metadata
				Object.assign(ret, f);
			}
			else if (returns === "array<color>") {
				ret = ret.map(c => Color.get(c));
			}

			return ret;
		};

		if (!(name in Color)) {
			Color[name] = func;
		}

		if (instance) {
			Color.prototype[name] = function (...args) {
				return func(this, ...args);
			};
		}
	}

	static defineFunctions (o) {
		for (let name in o) {
			Color.defineFunction(name, o[name], o[name]);
		}
	}

	static extend (exports) {
		if (exports.register) {
			exports.register(Color);
		}
		else {
			// No register method, just add the module's functions
			for (let name in exports) {
				Color.defineFunction(name, exports[name]);
			}
		}
	}
}

Color.defineFunctions({
	get,
	getAll,
	set,
	setAll,
	to,
	equals,
	inGamut,
	toGamut,
	distance,
	deltas,
	toString: serialize,
});

Object.assign(Color, {
	util,
	hooks,
	WHITES,
	Space: ColorSpace,
	spaces: ColorSpace.registry,
	parse,

	// Global defaults one may want to configure
	defaults,
});
