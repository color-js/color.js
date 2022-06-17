import {type} from "./util.js";
import whites from "./whites.js";

const ε = .000075;

export default class ColorSpace {
	constructor (options) {
		this.id = options.id;

		this.base = options.base ? ColorSpace.get(options.base) : null;

		let coords = options.coords ?? this.base.coords;
		if (Array.isArray(coords)) {
			coords = Object.fromEntries(coords.map(name => [name, {}]));
		}
		this.coords = coords;

		let white = options.white ?? this.base.white ?? whites.D65;
		if (typeof white === "string") {
			white = whites[white];
		}
		this.white = white;

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