import { serializeNumber, mapRange } from "./util.js";

export default class Type {
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
	}

	get computedRange () {
		if (this.range) {
			return this.range;
		}
		if (this.type === "<percentage>") {
			return [-1, 1];
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
	 * @returns
	 */
	resolve (number) {
		if (this.type === "<angle>") {
			return number;
		}

		let fromRange = this.computedRange;
		let toRange = this.coordRange;

		if (this.type === "<percentage>") {
			toRange ??= [-1, 1];
		}

		return mapRange(fromRange, toRange, number);
	}

	/**
	 * Serialize a number from the internal representation to a string
	 * @param {number} number
	 * @param {number} [precision]
	 * @returns
	 */
	serialize (number, precision) {
		let toRange = this.type === "<percentage>" ? [-100, 100] : this.computedRange;
		let unit = this.unit;

		number = mapRange(this.coordRange, toRange, number);
		number = serializeNumber(number, {unit, precision});

		return number;
	}

	toString () {
		let ret = this.type;

		if (this.range) {
			let [min = "", max = ""] = this.range;
			ret += `[${min},${max}]`;
		}

		return ret;
	}

	static get (type, ...args) {
		if (type instanceof this) {
			return type;
		}

		return new this(type, ...args);
	}
}
