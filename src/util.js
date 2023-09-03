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

	return toPrecision(n, precision) + (unit ??  "");
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
	return isNone(n)? 0 : n;
}

/**
 * Round a number to a certain number of significant digits
 * @param {number} n - The number to round
 * @param {number} precision - Number of significant digits
 */
export function toPrecision (n, precision) {
	n = +n;
	precision = +precision;
	let integerLength = (Math.floor(n) + "").length;

	if (precision > integerLength) {
		return +n.toFixed(precision - integerLength);
	}
	else {
		let p10 = 10 ** (integerLength - precision);
		return Math.round(n / p10) * p10;
	}
}

const angleFactor = {
	deg: 1,
	grad: 0.9,
	rad: 180/Math.PI,
	turn: 360,
};

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

	const isFunctionRegex = /^([a-z]+)\((.+?)\)$/i;
	const isNumberRegex = /^-?[\d.]+$/;
	const unitValueRegex = /%|deg|g?rad|turn$/;
	const singleArgument = /\/?\s*(none|[-\w.]+(?:%|deg|g?rad|turn)?)/g;
	let parts = str.match(isFunctionRegex);

	if (parts) {
		// It is a function, parse args
		let args = [];
		parts[2].replace(singleArgument, ($0, rawArg) => {
			let match = rawArg.match(unitValueRegex);
			let arg = rawArg;

			if (match) {
				let unit = match[0];
				// Drop unit from value
				let unitlessArg = arg.slice(0, -unit.length);

				if (unit === "%") {
					// Convert percentages to 0-1 numbers
					arg = new Number(unitlessArg / 100);
					arg.type = "<percentage>";
				}
				else {
					// Multiply angle by appropriate factor for its unit
					arg = new Number(unitlessArg * angleFactor[unit]);
					arg.type = "<angle>";
					arg.unit = unit;
				}
			}
			else if (isNumberRegex.test(arg)) {
				// Convert numerical args to numbers
				arg = new Number(arg);
				arg.type = "<number>";
			}
			else if (arg === "none") {
				arg = new Number(NaN);
				arg.none = true;
			}

			if ($0.startsWith("/")) {
				// It's alpha
				arg = arg instanceof Number? arg : new Number(arg);
				arg.alpha = true;
			}

			if (typeof arg === "object" && arg instanceof Number) {
				arg.raw = rawArg;
			}

			args.push(arg);
		});

		return {
			name: parts[1].toLowerCase(),
			rawName: parts[1],
			rawArgs: parts[2],
			// An argument could be (as of css-color-4):
			// a number, percentage, degrees (hue), ident (in color())
			args
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
