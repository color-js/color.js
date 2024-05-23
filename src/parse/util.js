
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