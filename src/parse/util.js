import { mapRange } from "../util.js";

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

const noneTypes = new Set(["<number>", "<percentage>", "<angle>"]);

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

/**
 * Validates the coordinates of a color against a format's coord grammar and
 * maps the coordinates to the range or refRange of the coordinates.
 * @param {ColorSpace} space - Colorspace the coords are in
 * @param {object} format - the format object to validate against
 * @param {string} name - the name of the color function. e.g. "oklab" or "color"
 * @returns {object[]} - an array of type metadata for each coordinate
 */
export function coerceCoords (space, format, name, coords) {
	let types = Object.entries(space.coords).map(([id, coordMeta], i) => {
		let coordGrammar = format.coordGrammar[i];
		let arg = coords[i];
		let providedType = arg?.type;

		// Find grammar alternative that matches the provided type
		// Non-strict equals is intentional because we are comparing w/ string objects
		let type;
		if (arg.none) {
			type = coordGrammar.find(c => noneTypes.has(c));
		}
		else {
			type = coordGrammar.find(c => c == providedType);
		}

		// Check that each coord conforms to its grammar
		if (!type) {
			// Type does not exist in the grammar, throw
			let coordName = coordMeta.name || id;
			throw new TypeError(`${providedType ?? arg.raw} not allowed for ${coordName} in ${name}()`);
		}

		let fromRange = type.range;

		if (providedType === "<percentage>") {
			fromRange ||= [0, 1];
		}

		let toRange = coordMeta.range || coordMeta.refRange;

		if (fromRange && toRange) {
			coords[i] = mapRange(fromRange, toRange, coords[i]);
		}

		return type;
	});

	return types;
}