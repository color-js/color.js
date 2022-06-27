import {type, parseCoordGrammar, toPrecision, mapRange} from "./util.js";
import {getWhite} from "./adapt.js";
import hooks from "./hooks.js";

const ε = .000075;

/**
 * Class to represent a color space
 */
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
				let format = this.formats[type][name];
				format.type ??= type;

				if (type === "functions") {
					format.name ??= name;
				}

				if (format.coords) {
					format.coordGrammar = parseCoordGrammar(format.coords);

					let coordFormats = Object.entries(this.coords).map(([id, coordMeta], i) => {
						// Preferred format for each coord is the first one
						let outputType = format.coordGrammar[i][0];

						let fromRange = coordMeta.range || coordMeta.refRange;
						let toRange = outputType.range, suffix = "";

						// Non-strict equals intentional since outputType could be a string object
						if (outputType == "<percentage>") {
							toRange = [0, 100];
							suffix = "%";
						}
						else if (outputType == "<angle>") {
							suffix = "deg";
						}

						return  {fromRange, toRange, suffix};
					});

					format.serializeCoords = (coords, precision) => {
						return coords.map((c, i) => {
							let {fromRange, toRange, suffix} = coordFormats[i];

							if (fromRange && toRange) {
								c = mapRange(fromRange, toRange, c);
							}

							c = toPrecision(c, precision);

							if (suffix) {
								c += suffix;
							}

							return c;
						})
					};
				}
			}
		}

		if (options.cssId && !this.formats.functions?.color) {
			this.formats.functions ??= {};
			this.formats.functions.color = { id: options.cssId };
			Object.defineProperty(this, "cssId", {value: options.cssId});
		}
		else if (this.formats.functions?.color && !this.formats.functions?.color.id) {
			this.formats.functions.color.id = this.id;
		}

		// Other stuff
		this.referred = options.referred;

		// Compute ancestors and store them, since they will never change
		this.#path = this.#getPath().reverse();

		hooks.run("colorspace-init-end", this);
	}

	inGamut (coords, {epsilon = ε} = {}) {
		if (this.isPolar) {
			// Do not check gamut through polar coordinates
			coords = this.toBase(coords);

			return this.base.inGamut(coords, {epsilon});
		}

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

	get isPolar() {
		for (let id in this.coords) {
			if (this.coords[id].type === "angle") {
				return true;
			}
		}

		return false;
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

		// Find connection space = lowest common ancestor in the base tree
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

	getMinCoords () {
		let ret = [];

		for (let id in this.coords) {
			let meta = this.coords[id];
			let range = meta.range || meta.refRange;
			ret.push(range?.min ?? 0);
		}

		return ret;
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
				return {space, id: meta[0], index: coord, ...meta[1]}
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
	}
}