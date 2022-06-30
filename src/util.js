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

/**
 * Round a number to a certain number of significant digits
 * @param {number} n - The number to round
 * @param {number} precision - Number of significant digits
 */
export function toPrecision(n, precision) {
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

	const isFunctionRegex = /^(?<name>[a-z-]+)\((?<args>.+?)\)$/i;
	const isNumberRegex = /^[+-]?\d?\.?\d+(e[+-]?\d+)?$/i;
	let parts = str.match(isFunctionRegex);

	if (parts) {
		// It is a function, parse args
		let args = [];
		parts.groups.args.replace(/\/?\s*(?<arg>[+-\w.]+(?<unit>%|deg|g?rad|turn)?)/gi, ($0, arg, unit) => {
			if (/%$/.test(arg)) {
				// Convert percentages to 0-1 numbers
				arg = new Number(arg.slice(0, -1) / 100);
				arg.type = "<percentage>";
			}
			else if (/(?:deg|g?rad|turn)$/.test(arg)) {
				// Drop the unit symbol and convert to number in degrees
                                switch (unit) {
				  case "deg": arg = new Number(+arg.slice(0, -3)); break;
				  case "grad": arg = new Number(+arg.slice(0, -4) / 10 * 9); break;
				  case "rad": arg = new Number(+arg.slice(0, -3) * 180 / Math.PI); break;
				  case "turn": arg = new Number(+arg.slice(0, -4) * 360); break;
                                }
				arg.type = "<angle>";
				arg.unit = unit;
			}
			else if (isNumberRegex.test(arg)) {
				// Convert numerical args to numbers
				arg = new Number(arg);
				arg.type = "<number>";
			}

			if ($0.startsWith("/")) {
				// It's alpha
				arg = arg instanceof Number? arg : new Number(arg);
				arg.alpha = true;
			}

			args.push(arg);
		});

		return {
			name: parts.groups.name.toLowerCase(),
			rawName: parts.groups.name,
			rawArgs: parts.groups.args,
			// An argument could be (as of css-color-4):
			// a number, percentage, angle (hue), ident (in color())
			args
		};
	}
}

export function last(arr) {
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

export function mapRange(from, to, value) {
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
