/**
 * Various utility functions
 */

export {default as multiplyMatrices} from "./multiply-matrices.js";

/**
 * Check if a value is a string (including a String object)
 * @param {*} str - Value to check
 * @returns {boolean}
 */
export function isString (str) {
	return type(str) === "string";
}

/**
 * Determine the internal JavaScript [[Class]] of an object.
 * @param {*} o - Value to check
 * @returns {string}
 */
export function type (o) {
	let str = Object.prototype.toString.call(o);

	return (str.match(/^\[object\s+(.*?)\]$/)[1] || "").toLowerCase();
}

export function serializeNumber (n, {precision, unit }) {
	if (isNone(n)) {
		return "none";
	}

	return toPrecision(n, precision) + (unit ?? "");
}

/**
 * Check if a value corresponds to a none argument
 * @param {*} n - Value to check
 * @returns {boolean}
 */
export function isNone (n) {
	return Number.isNaN(n) || (n instanceof Number && n?.none);
}

/**
 * Replace none values with 0
 */
export function skipNone (n) {
	return isNone(n) ? 0 : n;
}

/**
 * Round a number to a certain number of significant digits
 * @param {number} n - The number to round
 * @param {number} precision - Number of significant digits
 */
export function toPrecision (n, precision) {
	if (n === 0) {
		return 0;
	}
	let integer = ~~n;
	let digits = 0;
	if (integer && precision) {
		digits = ~~Math.log10(Math.abs(integer)) + 1;
	}
	const multiplier = 10.0 ** (precision - digits);
	return Math.floor(n * multiplier + 0.5) / multiplier;
}

/**
 * Units and multiplication factors for the internally stored numbers
 */
export const units = {
	"%": 0.01,
	deg: 1,
	grad: 0.9,
	rad: 180 / Math.PI,
	turn: 360,
};

export const regex = {
	// Need to list calc(NaN) explicitly as otherwise its ending paren would terminate the function call
	function: /^([a-z]+)\(((?:calc\(NaN\)|.)+?)\)$/i,
	number: /^([-+]?(?:[0-9]*\.)?[0-9]+(e[-+]?[0-9]+)?)$/i,
	unitValue: RegExp(`(${Object.keys(units).join("|")})$`),

	// NOTE The -+ are not just for prefix, but also for idents, and e+N notation!
	singleArgument: /\/?\s*(none|[-+\w.]+(?:%|deg|g?rad|turn)?)/g,
};

/**
 * Metadata for a parsed argument
 * @typedef {object} ArgumentMeta
 * @property {string} raw - The raw argument string
 * @property {string} type - The type of the argument, e.g. "<number>", "<angle>", "<percentage>"
 * @property {string} unit - The unit of the argument, if present e.g. "%", "deg"
 * @property {number} unitless - The number value of the argument, for arguments that have a unit
 * @property {boolean} none - Whether the argument is "none"
 */

/**
 * Parse a single function argument
 * @param {string} rawArg
 * @returns {{value: number, meta: ArgumentMeta}}
 */
export function parseArgument (rawArg) {
	let meta = {};
	let unit = rawArg.match(regex.unitValue)?.[0];
	let value = meta.raw = rawArg;

	if (unit) { // It’s a dimension token
		meta.type = unit === "%" ? "<percentage>" : "<angle>";
		meta.unit = unit;
		meta.unitless = Number(value.slice(0, -unit.length)); // unitless number

		value = meta.unitless * units[unit];
	}
	else if (regex.number.test(value)) { // It's a number
		// Convert numerical args to numbers
		value = Number(value);
		meta.type = "<number>";
	}
	else if (value === "none") {
		value = NaN;
		meta.none = true;
	}
	else {
		meta.type = "<ident>";
	}

	return { value, meta };
}

/**
* Parse a CSS function, regardless of its name and arguments
* @param String str String to parse
* @return {{name, args, rawArgs}}
*/
export function parseFunction (str) {
	if (!str) {
		return;
	}

	str = str.trim();

	let parts = str.match(regex.function);

	if (parts) {
		// It is a function, parse args
		let args = [];

		parts[2].replace(regex.singleArgument, ($0, rawArg) => {
			let {value, meta} = parseArgument(rawArg);

			if ($0.startsWith("/")) {
				// It's alpha
				meta.alpha = true;
			}

			let arg = value;

			// Objectify and add properties on the object
			if (typeof value === "number") {
				arg = Object.assign(new value.constructor(value), meta);
			}

			args.push(arg);
		});

		return {
			name: parts[1].toLowerCase(),
			rawName: parts[1],
			rawArgs: parts[2],
			// An argument could be (as of css-color-4):
			// a number, percentage, degrees (hue), ident (in color())
			args,
		};
	}
}

export function last (arr) {
	return arr[arr.length - 1];
}

export function interpolate (start, end, p) {
	if (isNaN(start)) {
		return end;
	}

	if (isNaN(end)) {
		return start;
	}

	return start + (end - start) * p;
}

export function interpolateInv (start, end, value) {
	return (value - start) / (end - start);
}

export function mapRange (from, to, value) {
	return interpolate(to[0], to[1], interpolateInv(from[0], from[1], value));
}

export function parseCoordGrammar (coordGrammars) {
	return coordGrammars.map(coordGrammar => {
		return coordGrammar.split("|").map(type => {
			type = type.trim();
			let range = type.match(/^(<[a-z]+>)\[(-?[.\d]+),\s*(-?[.\d]+)\]?$/);

			if (range) {
				let ret = new String(range[1]);
				ret.range = [+range[2], +range[3]];
				return ret;
			}

			return type;
		});
	});
}

/**
 * Clamp value between the minimum and maximum
 * @param {number} min minimum value to return
 * @param {number} val the value to return if it is between min and max
 * @param {number} max maximum value to return
 * @returns number
 */
export function clamp (min, val, max) {
	return Math.max(Math.min(max, val), min);
}

/**
 * Copy sign of one value to another.
 * @param {number} - to number to copy sign to
 * @param {number} - from number to copy sign from
 * @returns number
 */
export function copySign (to, from) {
	return Math.sign(to) === Math.sign(from) ? to : -to;
}

/**
 * Perform pow on a signed number and copy sign to result
 * @param {number} - base the base number
 * @param {number} - exp the exponent
 * @returns number
 */
export function spow (base, exp) {
	return copySign(Math.abs(base) ** exp, base);
}

/**
 * Perform a divide, but return zero if the numerator is zero
 * @param {number} n - the numerator
 * @param {number} d - the denominator
 * @returns number
 */
export function zdiv (n, d) {
	return (d === 0) ? 0 : n / d;
}

/**
 * Perform a bisect on a sorted list and locate the insertion point for
 * a value in arr to maintain sorted order.
 * @param {number[]} arr - array of sorted numbers
 * @param {number} value - value to find insertion point for
 * @param {number} lo - used to specify a the low end of a subset of the list
 * @param {number} hi - used to specify a the high end of a subset of the list
 * @returns number
 */
export function bisectLeft (arr, value, lo = 0, hi = arr.length) {
	while (lo < hi) {
		const mid = (lo + hi) >> 1;
		if (arr[mid] < value) {
			lo = mid + 1;
		}
		else {
			hi = mid;
		}
	}
	return lo;
}
