import { serializeNumber, mapRange, isNone } from "./util.js";

let instance = Symbol("instance");

const outputByType = {
	"<percentage>": {
		toRange: [0, 100],
		suffix: "%"
	},
	"<angle>": {
		toRange: [0, 360],
		suffix: "deg"
	},
}

/**
 * @class Format
 * Class to hold a color serialization format
 */
export default class Format {
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

		let spaceCoords = Object.values(space.coords);

		if (!this.coords) {
			this.coords = spaceCoords.map(coordMeta => {
				let ret = ["<number>", "<percentage>"];

				if (coordMeta.type === "angle") {
					ret.push("<angle>");
				}

				return ret;
			})
		}

		this.coords = this.coords.map((types, i) => {
			let coordMeta = spaceCoords[i];

			if (typeof types === "string") {
				types = types.trim().split(/\s*\|\s*/);
			}

			return types.map(type => Type.get(type, coordMeta));
		});
	}

	serializeCoords (coords, precision, types) {
		types = coords.map((_, i) => Type.get(types?.[i] ?? this.coords[i][0]));
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
		if (format instanceof Format) {
			return format;
		}

		if (format[instance]) {
			return format[instance];
		}

		return new Format(format, ...args);
	}
}

class Type {
	constructor (type, coordMeta) {
		if (typeof type === "object") {
			this.coordMeta = type;
		}

		if (coordMeta) {
			this.coordRange = coordMeta.range ?? coordMeta.refRange;
		}

		if (typeof type === "string") {
			let params = type.trim().match(/^(?<type><[a-z]+>)(\[(?<min>-?[.\d]+),\s*(?<max>-?[.\d]+)\])?$/);

			if (!params) {
				throw new TypeError(`Cannot parse ${type} as a type definition.`);
			}

			this.type = params.groups.type;
			let {min, max} = params.groups;

			if (min || max) {
				this.range = [+min, +max];
			}
		}

		if (!this.range) {
			if (this.type === "<percentage>") {
				this.range = [0, 1];
			}
			else if (this.type === "<angle>") {
				this.range = [0, 360];
			}
		}
	}

	get toRange () {
		if (this.type === "<percentage>") {
			return [0, 100];
		}
		else if (this.type === "<angle>") {
			return [0, 360];
		}

		return null;
	}

	get unit () {
		if (this.type === "<percentage>") {
			return "%";
		}
		else if (this.type === "<angle>") {
			return "deg";
		}

		return "";
	}

	resolve (arg) {
		let fromRange = this.range;
		let toRange = this.coordRange;

		return mapRange(fromRange, toRange, arg);
	}

	serialize (number, precision) {
		let {toRange, unit} = this;
		number = mapRange(this.coordRange, toRange, number);
		number = serializeNumber(number, {unit, precision});

		return number;
	}

	static get (type, ...args) {
		if (type instanceof Type) {
			return type;
		}

		return new Type(type, ...args);
	}
}