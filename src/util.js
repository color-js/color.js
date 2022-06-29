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

	const isFunctionRegex = /^([a-z]+)\((.+?)\)$/i;
	const isNumberRegex = /^-?[\d.]+$/;
	let parts = str.match(isFunctionRegex);

	if (parts) {
		// It is a function, parse args
		let args = [];
		parts[2].replace(/\/?\s*([-\w.]+(?:%|deg|g?rad|°|pi|turn)?)/g, ($0, arg) => {
			if (/%$/.test(arg)) {
				// Convert percentages to 0-1 numbers
				arg = new Number(arg.slice(0, -1) / 100);
				arg.type = "<percentage>";
			}
			else if (/deg$/.test(arg)) {
				// Drop deg from degrees and convert to number
				arg = new Number(+arg.slice(0, -3));
				arg.type = "<angle>";
				arg.unit = "deg";
			}
			else if (/°$/.test(arg)) { // this notation is not valid in CSS
				// Drop degree sign from degrees and convert to number
				arg = new Number(+arg.slice(0, -1));
				arg.type = "<angle>";
				arg.unit = "deg";
			}
			else if (/grad$/.test(arg)) { // check for 'grad' needs to come before check for 'rad' 
				// Drop grad from gradians (gon) and convert to number in degrees
				arg = new Number(+arg.slice(0, -4) / 10 * 9);
				arg.type = "<angle>";
				arg.unit = "deg";
			}
			else if (/rad$/.test(arg)) {
				// Drop rad from radians and convert to number in degrees
				arg = new Number(+arg.slice(0, -3) * 180 / Math.PI);
				arg.type = "<angle>";
				arg.unit = "deg";
			}
			else if (/pi$/.test(arg)) {// this unit is not valid in CSS
				// Drop pi from π radians and convert to number in degrees
				arg = new Number(+arg.slice(0, -2) * 180);
				arg.type = "<angle>";
				arg.unit = "deg";
			}
			else if (/turn$/.test(arg)) {
				// Drop turn from τ radians and convert to number in degrees
				arg = new Number(+arg.slice(0, -4) * 360);
				arg.type = "<angle>";
				arg.unit = "deg";
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
			name: parts[1].toLowerCase(),
			rawName: parts[1],
			rawArgs: parts[2],
			// An argument could be (as of css-color-4):
			// a number, percentage, degrees (hue), ident (in color())
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
