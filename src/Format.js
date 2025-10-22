import { isInstance, isNone } from "./util.js";
import Type from "./Type.js";

/** @import { ColorSpace, Coords } from "./types.js" */

// Type re-exports
/** @typedef {import("./types.js").Format} FormatInterface */

/**
 * @internal
 * Used to index {@link FormatInterface Format} objects and store an instance.
 * Not meant for external use
 */
export const instance = Symbol("instance");

/**
 * Remove the first element of an array type
 * @template {any[]} T
 * @typedef {T extends [any, ...infer R] ? R : T[number][]} RemoveFirstElement
 */

/**
 * @class Format
 * @implements {Omit<FormatInterface, "coords" | "serializeCoords">}
 * Class to hold a color serialization format
 */
export default class Format {
	// Class properties - declared here so that type inference works
	type;
	name;
	spaceCoords;
	/** @type {Type[][]} */
	coords;
	/** @type {string | undefined} */
	id;
	/** @type {boolean | undefined} */
	alpha;

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
			// @ts-expect-error Strings are converted to the correct type later
			this.coords = this.spaceCoords.map(coordMeta => {
				let ret = ["<number>", "<percentage>"];

				if (coordMeta.type === "angle") {
					ret.push("<angle>");
				}

				return ret;
			});
		}

		this.coords = this.coords.map(
			/** @param {string | string[] | Type[]} types */ (types, i) => {
				let coordMeta = this.spaceCoords[i];

				if (typeof types === "string") {
					types = types.trim().split(/\s*\|\s*/);
				}

				return types.map(type => Type.get(type, coordMeta));
			},
		);
	}

	/**
	 * @param {Coords} coords
	 * @param {number} precision
	 * @param {Type[]} types
	 */
	serializeCoords (coords, precision, types) {
		types = coords.map((_, i) =>
			Type.get(types?.[i] ?? this.coords[i][0], this.spaceCoords[i]));
		return coords.map((c, i) => types[i].serialize(c, precision));
	}

	/**
	 * Validates the coordinates of a color against a format's coord grammar and
	 * maps the coordinates to the range or refRange of the coordinates.
	 * @param {Coords} coords
	 * @param {[string, string, string]} types
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
				throw new TypeError(
					`${providedType ?? /** @type {any} */ (arg)?.raw ?? arg} not allowed for ${coordName} in ${this.name}()`,
				);
			}

			arg = type.resolve(arg);

			if (type.range) {
				// Adjust type to include range
				types[i] = type.toString();
			}

			return arg;
		});
	}

	/**
	 * @returns {boolean | Required<FormatInterface>["serialize"]}
	 */
	canSerialize () {
		return this.type === "function" || /** @type {any} */ (this).serialize;
	}

	/**
	 * @param {string} str
	 * @returns {(import("./types.js").ColorConstructor) | undefined | null}
	 */
	parse (str) {
		return null;
	}

	/**
	 * @param {Format | FormatInterface} format
	 * @param {RemoveFirstElement<ConstructorParameters<typeof Format>>} args
	 * @returns {Format}
	 */
	static get (format, ...args) {
		if (!format || isInstance(format, this)) {
			return /** @type {Format} */ (format);
		}

		if (format[instance]) {
			return format[instance];
		}

		return new Format(format, ...args);
	}
}
