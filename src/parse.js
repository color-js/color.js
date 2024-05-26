import { isNone, clamp } from "./util.js";
import hooks from "./hooks.js";
import ColorSpace from "./space.js";
import defaults from "./defaults.js";

/**
 * Convert a CSS Color string to a color object
 * @param {string} str
 * @param {object} [options]
 * @param {object} [options.meta] - Object for additional information about the parsing
 * @returns {Color}
 */
export default function parse (str, {meta} = {}) {
	let env = {"str": String(str)?.trim()};
	hooks.run("parse-start", env);

	if (env.color) {
		return env.color;
	}

	env.parsed = parseFunction(env.str);
	let ret;

	if (env.parsed) {
		// Is a functional syntax
		let name = env.parsed.name;
		let format;
		let space;
		let coords = env.parsed.args;
		let types = coords.map((c, i) => env.parsed.argMeta[i]?.type);

		if (name === "color") {
			// color() function
			let id = coords.shift();
			types.shift();
			// Check against both <dashed-ident> and <ident> versions
			let alternateId = id.startsWith("--") ? id.substring(2) : `--${id}`;
			let ids = [id, alternateId];
			format = ColorSpace.findFormat({name, id: ids, type: "function"});

			if (!format) {
				// Not found
				let didYouMean;

				let registryId = id in ColorSpace.registry ? id : alternateId;
				if (registryId in ColorSpace.registry) {
					// Used color space id instead of color() id, these are often different
					let cssId = ColorSpace.registry[registryId].formats?.color?.id;

					if (cssId) {
						let altColor = str.replace("color(" + id, "color(" + cssId);
						didYouMean = `Did you mean ${ altColor }?`;
					}
				}

				throw new TypeError(`Cannot parse ${env.str}. ` + (didYouMean ?? "Missing a plugin?"));
			}

			space = format.space;

			if (format.id.startsWith("--") && !id.startsWith("--")) {
				defaults.warn(`${space.name} is a non-standard space and not currently supported in the CSS spec. ` +
							  `Use prefixed color(${format.id}) instead of color(${id}).`);
			}
			if (id.startsWith("--") && !format.id.startsWith("--")) {
				defaults.warn(`${space.name} is a standard space and supported in the CSS spec. ` +
							  `Use color(${format.id}) instead of prefixed color(${id}).`);
			}
		}
		else {
			format = ColorSpace.findFormat({name, type: "function"});
			space = format.space;
		}

		let alpha = 1;

		if (format.alpha === true || env.parsed.lastAlpha) {
			alpha = env.parsed.args.pop();
		}

		let coordCount = format.coords.length;

		if (coords.length !== coordCount) {
			throw new TypeError(`Expected ${coordCount} coordinates for ${space.id} in ${env.str}), got ${coords.length}`);
		}

		coords = format.coerceCoords(coords, types);

		if (meta) {
			Object.assign(meta, {format, formatId: format.name, types});
		}

		ret = {spaceId: space.id, coords, alpha};
	}
	else {
		// Custom, colorspace-specific format
		for (let space of ColorSpace.all) {
			for (let formatId in space.formats) {
				let format = space.formats[formatId];

				if (format.type !== "custom") {
					continue;
				}

				if (format.test && !format.test(env.str)) {
					continue;
				}

				let color = format.parse(env.str);

				if (color) {
					if (meta) {
						Object.assign(meta, { format, formatId });
					}

					ret = color;
					break;
				}
			}
		}
	}

	if (!ret) {
		// If we're here, we couldn't parse
		throw new TypeError(`Could not parse ${str} as a color. Missing a plugin?`);
	}

	// Clamp alpha to [0, 1]
	ret.alpha = isNone(ret.alpha) ? ret.alpha : ret.alpha === undefined ? 1 : clamp(0, ret.alpha, 1);

	return ret;
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
	singleArgument: /\/?\s*(none|NaN|calc\(NaN\)|[-+\w.]+(?:%|deg|g?rad|turn)?)/g,
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
		value = null;
	}
	else if (value === "NaN" || value === "calc(NaN)") {
		value = NaN;
		meta.type = "<number>";
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
		let argMeta = [];
		let lastAlpha = false;

		parts[2].replace(regex.singleArgument, ($0, rawArg) => {
			let {value, meta} = parseArgument(rawArg);

			if ($0.startsWith("/")) {
				// It's alpha
				lastAlpha = true;
			}

			args.push(value);
			argMeta.push(meta);
		});

		return {
			name: parts[1].toLowerCase(),
			args,
			argMeta,
			lastAlpha,
			rawName: parts[1],
			rawArgs: parts[2],
		};
	}
}
