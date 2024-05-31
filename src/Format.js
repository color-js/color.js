import { isNone } from "./util.js";
import Type from "./Type.js";

// Type "imports"
/** @typedef {import("./types.js").ColorSpace} ColorSpace */
/** @typedef {import("./types.js").Format} FormatInterface */

export const instance = Symbol("instance");

/**
 * @class Format
 * Class to hold a color serialization format
 */
export default class Format {
	// Class properties - declared here so that type inference works
	type;
	name;
	spaceCoords;
	/** @type {[Type, Type, Type]} */
	coords;

	/**
	 * @param {FormatInterface} format
	 * @param {ColorSpace} space
	 */
	constructor (format, space = format.space) {
		format[instance] = this;
		this.type = "function";
		this.name = "color";

		Object.assign(this, format);

		this.space = space;

		if (this.type === "custom") {
			// Nothing else to do here
			return;
		}

		this.spaceCoords = Object.values(space.coords);

		if (!this.coords) {
			this.coords = this.spaceCoords.map(coordMeta => {
				let ret = ["<number>", "<percentage>"];

				if (coordMeta.type === "angle") {
					ret.push("<angle>");
				}

				return ret;
			});
		}

		this.coords = this.coords.map((types, i) => {
			let coordMeta = this.spaceCoords[i];

			if (typeof types === "string") {
				types = types.trim().split(/\s*\|\s*/);
			}

			return types.map(type => Type.get(type, coordMeta));
		});
	}

	serializeCoords (coords, precision, types) {
		types = coords.map((_, i) => Type.get(types?.[i] ?? this.coords[i][0], this.spaceCoords[i]));
		return coords.map((c, i) => types[i].serialize(c, precision));
	}

	/**
 	 * Validates the coordinates of a color against a format's coord grammar and
	 * maps the coordinates to the range or refRange of the coordinates.
	 * @param {ColorSpace} space - Colorspace the coords are in
	 * @param {object} format - the format object to validate against
	 * @param {string} name - the name of the color function. e.g. "oklab" or "color"
	 * @returns {number[]} - Mapped coords
	 */
	coerceCoords (coords, types) {
		return Object.entries(this.space.coords).map(([id, coordMeta], i) => {
			let arg = coords[i];

			if (isNone(arg) || isNaN(arg)) {
				// Nothing to do here
				return arg;
			}

			// Find grammar alternative that matches the provided type
			// Non-strict equals is intentional because we are comparing w/ string objects
			let providedType = types[i];
			let type = this.coords[i].find(c => c.type == providedType);

			// Check that each coord conforms to its grammar
			if (!type) {
				// Type does not exist in the grammar, throw
				let coordName = coordMeta.name || id;
				throw new TypeError(`${ providedType ?? arg?.raw ?? arg } not allowed for ${coordName} in ${this.name}()`);
			}

			arg = type.resolve(arg);

			return arg;
		});
	}

	static get (format, ...args) {
		if (!format || format instanceof Format) {
			return format;
		}

		if (format[instance]) {
			return format[instance];
		}

		return new Format(format, ...args);
	}
}
