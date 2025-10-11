import { serializeNumber, mapRange, isInstance } from "./util.js";

export default class Type {
	// Class properties - declared here so that type inference works
	type;
	coordMeta;
	coordRange;
	/** @type {[number, number]} */
	range;

	/**
	 * @param {any} type
	 * @param {import("./types.js").CoordMeta} coordMeta
	 */
	constructor (type, coordMeta) {
		if (typeof type === "object") {
			this.coordMeta = type;
		}

		if (coordMeta) {
			this.coordMeta = coordMeta;
			this.coordRange = coordMeta.range ?? coordMeta.refRange;
		}

		if (typeof type === "string") {
			let params = type
				.trim()
				.match(/^(?<type><[a-z]+>)(\[(?<min>-?[.\d]+),\s*(?<max>-?[.\d]+)\])?$/);

			if (!params) {
				throw new TypeError(`Cannot parse ${type} as a type definition.`);
			}

			this.type = params.groups.type;
			let { min, max } = params.groups;

			if (min || max) {
				this.range = [+min, +max];
			}
		}
	}

	/** @returns {[number, number]} */
	get computedRange () {
		if (this.range) {
			return this.range;
		}
		if (this.type === "<percentage>") {
			return this.percentageRange();
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

	/**
	 * Map a number to the internal representation
	 * @param {number} number
	 */
	resolve (number) {
		if (this.type === "<angle>") {
			return number;
		}

		let fromRange = this.computedRange;
		let toRange = this.coordRange;

		if (this.type === "<percentage>") {
			toRange ??= this.percentageRange();
		}

		return mapRange(fromRange, toRange, number);
	}

	/**
	 * Serialize a number from the internal representation to a string
	 * @param {number} number
	 * @param {number} [precision]
	 */
	serialize (number, precision) {
		let toRange = this.type === "<percentage>" ? this.percentageRange(100) : this.computedRange;

		let unit = this.unit;

		number = mapRange(this.coordRange, toRange, number);
		return serializeNumber(number, { unit, precision });
	}

	toString () {
		let ret = this.type;

		if (this.range) {
			let [min = "", max = ""] = this.range;
			ret += `[${min},${max}]`;
		}

		return ret;
	}

	/**
	 * Returns a percentage range for values of this type
	 * @param {number} scale
	 * @returns {[number, number]}
	 */
	percentageRange (scale = 1) {
		let range;
		if (
			(this.coordMeta && this.coordMeta.range) ||
			(this.coordRange && this.coordRange[0] >= 0)
		) {
			range = [0, 1];
		}
		else {
			range = [-1, 1];
		}
		return [range[0] * scale, range[1] * scale];
	}

	static get (type, coordMeta) {
		if (isInstance(type, this)) {
			return type;
		}

		return new this(type, coordMeta);
	}
}
