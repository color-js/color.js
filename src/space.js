import {type} from "./util.js";
import {getWhite} from "./adapt.js";

const ε = .000075;

export default class ColorSpace {
	constructor (options) {
		this.id = options.id;
		this.name = options.name;
		this.base = options.base ? ColorSpace.get(options.base) : null;

		if (this.base) {
			this.fromBase = options.fromBase;
			this.toBase = options.toBase;
		}

		// Coordinate metadata

		let coords = options.coords ?? this.base.coords;
		this.coords = coords;

		// White point

		let white = options.white ?? this.base.white ?? "D65";
		this.white = getWhite(white);

		// Sort out formats

		this.formats = options.formats ?? {};
		for (let type in this.formats) {
			for (let name in this.formats[type]) {
				this.formats[type][name].type ??= type;

				if (type === "functions") {
					this.formats[type][name].name ??= name;
				}
			}
		}

		if (options.cssId && !this.formats.functions?.color) {
			this.formats.functions ??= {};
			this.formats.functions.color = { id: options.cssId };
			Object.defineProperty(this, "cssId", {value: options.cssId});
		}

		// Other stuff
		this.referred = options.referred;

		// Compute ancestors and store them, since they will never change
		this.#path = this.#getPath().reverse();
	}

	inGamut (coords, {epsilon = ε} = {}) {
		let coordMeta = Object.values(this.coords);

		return coords.every((c, i) => {
			let meta = coordMeta[i];

			if (meta.type !== "angle" && meta.range) {
				if (Number.isNaN(c)) {
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

	get cssId () {
		return this.formats.functions?.color?.id || this.id;
	}

	getFormat (format) {
		if (typeof format === "object") {
			return format;
		}

		for (let type in this.formats) {
			for (let name in this.formats[type]) {
				if (format === name || format === "default") {
					return this.formats[type][name];
				}
			}
		}
	}

	#path

	#getPath () {
		let ret = [this];

		for (let space = this; space = space.base;) {
			ret.push(space);
		}

		return ret;
	}

	to (space, coords) {
		space = ColorSpace.get(space);

		if (this === space) {
			// Same space, no change needed
			return coords;
		}

		// Convert NaN to 0, which seems to be valid in every coordinate of every color space
		coords = coords.map(c => Number.isNaN(c)? 0 : c);

		let myPath = this.#path;
		let otherPath = space.#path;

		let connectionSpace, connectionSpaceIndex;

		for (let i=0; i < myPath.length; i++) {
			if (myPath[i] === otherPath[i]) {
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

	toString () {
		return `${this.name} (${this.id})`;
	}

	static registry = {}

	static get all () {
		return Object.values(ColorSpace.registry);
	}

	static register (id, space) {
		if (arguments.length === 1) {
			space = arguments[0];
			id = space.id;
		}

		space = this.get(space);
		this.registry[id] = space;
		return space;
	}

	static create (options) {
		let space = new this(options);
		return this.register(space);
	}

	/**
	 * Lookup ColorSpace object by name
	 * @param {ColorSpace | string} name
	 */
	static get (space) {
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

		throw new TypeError(`${space} is not a valid color space`);
	}

	static DEFAULT_FORMAT = {
		type: "functions",
		name: "color",
	}
}