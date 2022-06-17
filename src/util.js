import Color from "./color.js";
import multiplyMatrices from "./multiply-matrices.js";

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
 * Like Object.assign() but copies property descriptors (including symbols)
 * @param {Object} target - Object to copy to
 * @param {...Object} sources - Objects to copy from
 * @returns {Object} target
 */
export function extend (target, ...sources) {
	for (let source of sources) {
		if (source) {
			let descriptors = Object.getOwnPropertyDescriptors(source);
			Object.defineProperties(target, descriptors);
		}
	}

	return target;
}

/**
 * Copy a descriptor from one object to another
 * @param {Object} target - Object to copy to
 * @param {Object} source - Object to copy from
 * @param {string} prop - Name of property
 */
export function copyDescriptor (target, source, prop) {
	let descriptor = Object.getOwnPropertyDescriptor(source, prop);
	Object.defineProperty(target, prop, descriptor);
}

/**
 * Uppercase the first letter of a string
 * @param {string} str - String to capitalize
 * @returns Capitalized string
 */
export function capitalize(str) {
	if (!str) {
		return str;
	}

	return str[0].toUpperCase() + str.slice(1);
}

/**
 * Round a number to a certain number of significant digits based on a range
 * @param {number} n - The number to round
 * @param {number} precision - Number of significant digits
 */
export function toPrecision(n, precision) {
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

export function value(obj, prop, value) {
	let props = prop.split(".");
	let lastProp = props.pop();

	obj = props.reduceRight((acc, cur) => {
		return acc && acc[cur];
	}, obj);

	if (obj) {
		if (value === undefined) {
			// Get
			return obj[lastProp];
		}
		else {
			// Set
			return obj[lastProp] = value;
		}
	}
}

/**
* Parse a CSS function, regardless of its name and arguments
* @param String str String to parse
* @return Object An object with {name, args, rawArgs}
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
		parts[2].replace(/\/?\s*([-\w.]+(?:%|deg)?)/g, ($0, arg) => {
			if (/%$/.test(arg)) {
				// Convert percentages to 0-1 numbers
				arg = new Number(+arg.slice(0, -1) / 100);
				arg.percentage = true;
			}
			else if (/deg$/.test(arg)) {
				// Drop deg from degrees and convert to number
				arg = new Number(+arg.slice(0, -3));
				arg.deg = true;
			}
			else if (isNumberRegex.test(arg)) {
				// Convert numerical args to numbers
				arg = +arg;
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

export {multiplyMatrices};
