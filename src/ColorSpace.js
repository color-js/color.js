/**
 * @packageDocumentation
 * Defines the class and other types related to creating color spaces.
 * For the builtin color spaces, see the `spaces` module.
 */
import { type, isNone } from "./util.js";
import Format from "./Format.js";
import {getWhite} from "./adapt.js";
import hooks from "./hooks.js";
import getColor from "./getColor.js";

const ε = .000075;

/**
 * Class to represent a color space
 */
export default class ColorSpace {
	constructor (options) {
		this.id = options.id;
		this.name = options.name;
		this.base = options.base ? ColorSpace.get(options.base) : null;
		this.aliases = options.aliases;

		if (this.base) {
			this.fromBase = options.fromBase;
			this.toBase = options.toBase;
		}

		// Coordinate metadata

		let coords = options.coords ?? this.base.coords;

		for (let name in coords) {
			if (!("name" in coords[name])) {
				coords[name].name = name;
			}
		}
		this.coords = coords;

		// White point

		let white = options.white ?? this.base.white ?? "D65";
		this.white = getWhite(white);

		// Sort out formats

		this.formats = options.formats ?? {};

		for (let name in this.formats) {
			let format = this.formats[name];
			format.type ||= "function";
			format.name ||= name;
		}

		if (!this.formats.color?.id) {
			this.formats.color = {
				...this.formats.color ?? {},
				id: options.cssId || this.id,
			};
		}

		// Gamut space

		if (options.gamutSpace) {
			// Gamut space explicitly specified
			this.gamutSpace = options.gamutSpace === "self" ? this : ColorSpace.get(options.gamutSpace);
		}
		else {
			// No gamut space specified, calculate a sensible default
			if (this.isPolar) {
				// Do not check gamut through polar coordinates
				this.gamutSpace = this.base;
			}
			else {
				this.gamutSpace =  this;
			}
		}

		// Optimize inGamut for unbounded spaces
		if (this.gamutSpace.isUnbounded) {
			this.inGamut = (coords, options) => {
				return true;
			};
		}

		// Other stuff
		this.referred = options.referred;

		// Compute ancestors and store them, since they will never change
		Object.defineProperty(this, "path", {
			value: getPath(this).reverse(),
			writable: false,
			enumerable: true,
			configurable: true,
		});

		hooks.run("colorspace-init-end", this);
	}

	inGamut (coords, {epsilon = ε} = {}) {
		if (!this.equals(this.gamutSpace)) {
			coords = this.to(this.gamutSpace, coords);
			return this.gamutSpace.inGamut(coords, {epsilon});
		}

		let coordMeta = Object.values(this.coords);

		return coords.every((c, i) => {
			let meta = coordMeta[i];

			if (meta.type !== "angle" && meta.range) {
				if (isNone(c)) {
					// NaN is always in gamut
					return true;
				}

				let [min, max] = meta.range;
				return (min === undefined || c >= min - epsilon)
				    && (max === undefined || c <= max + epsilon);
			}

			return true;
		});
	}

	get isUnbounded () {
		return Object.values(this.coords).every(coord => !("range" in coord));
	}

	get cssId () {
		return this.formats?.color?.id || this.id;
	}

	get isPolar () {
		for (let id in this.coords) {
			if (this.coords[id].type === "angle") {
				return true;
			}
		}

		return false;
	}

	/**
	 * Lookup a format in this color space
	 * @param {string | object | Format} format - Format id if string. If object, it's converted to a `Format` object and returned.
	 * @returns {Format}
	 */
	getFormat (format) {
		if (!format) {
			return null;
		}

		if (format === "default") {
			format = Object.values(this.formats)[0];
		}
		else if (typeof format === "string") {
			format = this.formats[format];
		}

		let ret = Format.get(format, this);

		if (ret !== format && format.name in this.formats) {
			// Update the format we have on file so we can find it more quickly next time
			this.formats[format.name] = ret;
		}

		return ret;
	}

	/**
	 * Check if this color space is the same as another color space reference.
	 * Allows proxying color space objects and comparing color spaces with ids.
	 * @param {string | ColorSpace} space ColorSpace object or id to compare to
	 * @returns {boolean}
	 */
	equals (space) {
		if (!space) {
			return false;
		}

		return this === space || this.id === space || this.id === space.id;
	}

	to (space, coords) {
		if (arguments.length === 1) {
			const color = getColor(space);
			[space, coords] = [color.space, color.coords];
		}

		space = ColorSpace.get(space);

		if (this.equals(space)) {
			// Same space, no change needed
			return coords;
		}

		// Convert NaN to 0, which seems to be valid in every coordinate of every color space
		coords = coords.map(c => isNone(c) ? 0 : c);

		// Find connection space = lowest common ancestor in the base tree
		let myPath = this.path;
		let otherPath = space.path;

		let connectionSpace, connectionSpaceIndex;

		for (let i = 0; i < myPath.length; i++) {
			if (myPath[i].equals(otherPath[i])) {
				connectionSpace = myPath[i];
				connectionSpaceIndex = i;
			}
			else {
				break;
			}
		}

		if (!connectionSpace) {
			// This should never happen
			throw new Error(`Cannot convert between color spaces ${this} and ${space}: no connection space was found`);
		}

		// Go up from current space to connection space
		for (let i = myPath.length - 1; i > connectionSpaceIndex; i--) {
			coords = myPath[i].toBase(coords);
		}

		// Go down from connection space to target space
		for (let i = connectionSpaceIndex + 1; i < otherPath.length; i++) {
			coords = otherPath[i].fromBase(coords);
		}

		return coords;
	}

	from (space, coords) {
		if (arguments.length === 1) {
			const color = getColor(space);
			[space, coords] = [color.space, color.coords];
		}

		space = ColorSpace.get(space);

		return space.to(this, coords);
	}

	toString () {
		return `${this.name} (${this.id})`;
	}

	getMinCoords () {
		let ret = [];

		for (let id in this.coords) {
			let meta = this.coords[id];
			let range = meta.range || meta.refRange;
			ret.push(range?.min ?? 0);
		}

		return ret;
	}

	static registry = {};

	// Returns array of unique color spaces
	static get all () {
		return [...new Set(Object.values(ColorSpace.registry))];
	}

	static register (id, space) {
		if (arguments.length === 1) {
			space = arguments[0];
			id = space.id;
		}

		space = this.get(space);

		if (this.registry[id] && this.registry[id] !== space) {
			throw new Error(`Duplicate color space registration: '${id}'`);
		}
		this.registry[id] = space;

		// Register aliases when called without an explicit ID.
		if (arguments.length === 1 && space.aliases) {
			for (let alias of space.aliases) {
				this.register(alias, space);
			}
		}

		return space;
	}

	/**
	 * Lookup ColorSpace object by name
	 * @param {ColorSpace | string} name
	 */
	static get (space, ...alternatives) {
		if (!space || space instanceof ColorSpace) {
			return space;
		}

		let argType = type(space);

		if (argType === "string") {
			// It's a color space id
			let ret = ColorSpace.registry[space.toLowerCase()];

			if (!ret) {
				throw new TypeError(`No color space found with id = "${space}"`);
			}

			return ret;
		}

		if (alternatives.length) {
			return ColorSpace.get(...alternatives);
		}

		throw new TypeError(`${space} is not a valid color space`);
	}

	/**
	 * Look up all color spaces for a format that matches certain criteria
	 * @param {object | string} filters
	 * @param {Array<ColorSpace>} [spaces=ColorSpace.all]
	 * @returns {Format | null}
	 */
	static findFormat (filters, spaces = ColorSpace.all) {
		if (!filters) {
			return null;
		}

		if (typeof filters === "string") {
			filters = {name: filters};
		}

		for (let space of spaces) {
			for (let [name, format] of Object.entries(space.formats)) {
				format.name ??= name;
				format.type ??= "function";

				let matches = (
					(!filters.name || format.name === filters.name) &&
					(!filters.type || format.type === filters.type)
				);

				if (filters.id) {
					let ids = format.ids || [format.id];
					let filterIds = Array.isArray(filters.id) ? filters.id : [filters.id];
					matches &&= filterIds.some(id => ids.includes(id));
				}

				if (matches) {
					let ret = Format.get(format, space);

					if (ret !== format) {
						space.formats[format.name] = ret;
					}

					return ret;
				}
			}
		}

		return null;
	}

	/**
	 * Get metadata about a coordinate of a color space
	 *
	 * @static
	 * @param {Array | string} ref
	 * @param {ColorSpace | string} [workingSpace]
	 * @return {Object}
	 */
	static resolveCoord (ref, workingSpace) {
		let coordType = type(ref);
		let space, coord;

		if (coordType === "string") {
			if (ref.includes(".")) {
				// Absolute coordinate
				[space, coord] = ref.split(".");
			}
			else {
				// Relative coordinate
				[space, coord] = [, ref];
			}
		}
		else if (Array.isArray(ref)) {
			[space, coord] = ref;
		}
		else {
			// Object
			space = ref.space;
			coord = ref.coordId;
		}

		space = ColorSpace.get(space);

		if (!space) {
			space = workingSpace;
		}

		if (!space) {
			throw new TypeError(`Cannot resolve coordinate reference ${ref}: No color space specified and relative references are not allowed here`);
		}

		coordType = type(coord);

		if (coordType === "number" || coordType === "string" && coord >= 0) {
			// Resolve numerical coord
			let meta = Object.entries(space.coords)[coord];

			if (meta) {
				return {space, id: meta[0], index: coord, ...meta[1]};
			}
		}

		space = ColorSpace.get(space);

		let normalizedCoord = coord.toLowerCase();

		let i = 0;
		for (let id in space.coords) {
			let meta = space.coords[id];

			if (id.toLowerCase() === normalizedCoord || meta.name?.toLowerCase() === normalizedCoord) {
				return {space, id, index: i, ...meta};
			}

			i++;
		}

		throw new TypeError(`No "${coord}" coordinate found in ${space.name}. Its coordinates are: ${Object.keys(space.coords).join(", ")}`);
	}

	static DEFAULT_FORMAT = {
		type: "functions",
		name: "color",
	};
}

function getPath (space) {
	let ret = [space];

	for (let s = space; s = s.base;) {
		ret.push(s);
	}

	return ret;
}
