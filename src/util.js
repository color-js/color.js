import multiplyMatrices from "./multiply-matrices.js";

/**
 * Check if a value is a string (including a String object)
 * @param {*} str - Value to check
 * @returns {boolean}
 */
export function isString (str) {
	return Object.prototype.toString.call(str) === "[object String]";
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

	return str.toUpperCase() + str.slice(1);
}

/**
 * Round a number to a certain number of significant digits based on a range
 * @param {number} n - The number to round
 * @param {number} precision - Number of significant digits
 * @param {Array[2]} range - Range to base decimals on
 */
export function toPrecision(n, precision, range = [0, 1]) {
	precision = +precision;
	let digits = ((range[1] || range[0] || 1) + "").length;
	let decimals = precision + 1 - digits;
	
	return +n.toFixed(decimals);
}

export {multiplyMatrices};
