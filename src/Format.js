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

		if (this.coords) {
			// Format has a coord specification
			this.coords = format.coords.map(coordGrammar => {
				return coordGrammar.split("|").map(type => {
					return Type.get(type);
				});
			});
		}
		else {
			// Generate coord grammar from color space metadata
			this.coords = spaceCoords.map(coordMeta => {
				let {range, refRange} = coordMeta;
				let ret = [
					{type: "<number>", range},
					{type: "<percentage>", range: range ?? refRange ?? [0, 1]},
				];

				if (coordMeta.type === "angle") {
					ret.push("<angle>");
				}

				return ret.map(Type.get);
			});
		}

		this.coordFormats = spaceCoords.map((coordMeta, i) => {
			// Preferred format for each coord is the first one
			let outputType = this.coords[i][0];

			let fromRange = coordMeta.range || coordMeta.refRange;

			let {toRange, suffix} = outputByType[outputType.type] || {toRange: outputType.range, suffix: ""};

			return {fromRange, toRange, suffix};
		});

	}

	serializeCoords (coords, precision) {
		return coords.map((c, i) => {
			let {fromRange, toRange, suffix} = this.coordFormats[i];

			c = mapRange(fromRange, toRange, c);
			c = serializeNumber(c, {precision, unit: suffix});

			return c;
		});
	}

	/**
 	 * Validates the coordinates of a color against a format's coord grammar and
	 * maps the coordinates to the range or refRange of the coordinates.
	 * @param {ColorSpace} space - Colorspace the coords are in
	 * @param {object} format - the format object to validate against
	 * @param {string} name - the name of the color function. e.g. "oklab" or "color"
	 * @returns {number[]} - Mapped coords
	 */
	coerceCoords (coords) {
		return Object.entries(this.space.coords).map(([id, coordMeta], i) => {
			let arg = coords[i];

			if (isNone(arg)) {
				// Nothing to do here
				return arg;
			}

			// Find grammar alternative that matches the provided type
			// Non-strict equals is intentional because we are comparing w/ string objects
			let providedType = arg.type;
			let type = this.coords[i].find(c => c.type == providedType);

			// Check that each coord conforms to its grammar
			if (!type) {
				// Type does not exist in the grammar, throw
				let coordName = coordMeta.name || id;
				throw new TypeError(`${ providedType ?? arg?.raw ?? arg } not allowed for ${coordName} in ${this.name}()`);
			}

			let fromRange = type.range;
			let toRange = coordMeta.range || coordMeta.refRange;

			if (fromRange && toRange) {
				return mapRange(fromRange, toRange, arg);
			}

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
	constructor (type) {
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
			else if (this.type === "<percentage>") {
				this.range = [0, 1];
			}

		}
		else {
			Object.assign(this, type);
		}
	}

	static get (type) {
		if (type instanceof Type) {
			return type;
		}

		return new Type(type);
	}
}