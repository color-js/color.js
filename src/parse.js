import * as util from "./util.js";
import hooks from "./hooks.js";
import ColorSpace from "./space.js";

/**
 * Convert a CSS Color string to a color object
 * @param {string} str
 * @param {object} [options]
 * @param {object} [options.meta] - Object for additional information about the parsing
 * @returns { Color }
 */
export default function parse (str, {meta} = {}) {
	let env = {"str": String(str)?.trim()};
	hooks.run("parse-start", env);

	if (env.color) {
		return env.color;
	}

	env.parsed = util.parseFunction(env.str);

	if (env.parsed) {
		// Is a functional syntax
		let name = env.parsed.name;

		if (name === "color") {
			// color() function
			let id = env.parsed.args.shift();
			let alpha = env.parsed.rawArgs.indexOf("/") > 0? env.parsed.args.pop() : 1;

			for (let space of ColorSpace.all) {
				let colorSpec = space.getFormat("color");

				if (colorSpec) {
					if (id === colorSpec.id || colorSpec.ids?.includes(id)) {
						// From https://drafts.csswg.org/css-color-4/#color-function
						// If more <number>s or <percentage>s are provided than parameters that the colorspace takes, the excess <number>s at the end are ignored.
						// If less <number>s or <percentage>s are provided than parameters that the colorspace takes, the missing parameters default to 0. (This is particularly convenient for multichannel printers where the additional inks are spot colors or varnishes that most colors on the page won’t use.)
						const coords = Object.keys(space.coords).map((_, i) => env.parsed.args[i] || 0);

						if (meta) {
							meta.formatId = "color";
						}

						return {spaceId: space.id, coords, alpha};
					}
				}
			}

			// Not found
			let didYouMean = "";
			if (id in ColorSpace.registry) {
				// Used color space id instead of color() id, these are often different
				let cssId = ColorSpace.registry[id].formats?.functions?.color?.id;

				if (cssId) {
					didYouMean = `Did you mean color(${cssId})?`;
				}
			}

			throw new TypeError(`Cannot parse color(${id}). ` + (didYouMean || "Missing a plugin?"));
		}
		else {
			for (let space of ColorSpace.all) {
				// color space specific function
				let format = space.getFormat(name);
				if (format && format.type === "function") {
					let alpha = 1;

					if (format.lastAlpha || util.last(env.parsed.args).alpha) {
						alpha = env.parsed.args.pop();
					}

					let coords = env.parsed.args;

					let types;

					if (format.coordGrammar) {
						types = Object.entries(space.coords).map(([id, coordMeta], i) => {
							let coordGrammar = format.coordGrammar[i];
							let providedType = coords[i]?.type;

							// Find grammar alternative that matches the provided type
							// Non-strict equals is intentional because we are comparing w/ string objects
							let type = coordGrammar.find(c => c == providedType);

							// Check that each coord conforms to its grammar
							if (!type) {
								// Type does not exist in the grammar, throw
								let coordName = coordMeta.name || id;
								throw new TypeError(`${providedType} not allowed for ${coordName} in ${name}()`);
							}

							let fromRange = type.range;

							if (providedType === "<percentage>") {
								fromRange ||= [0, 1];
							}

							let toRange = coordMeta.range || coordMeta.refRange;

							if (fromRange && toRange) {
								coords[i] = util.mapRange(fromRange, toRange, coords[i]);
							}

							return type;
						});
					}

					if (meta) {
						Object.assign(meta, {formatId: format.name, types});
					}

					return {
						spaceId: space.id,
						coords, alpha
					};
				}
			}
		}
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
					color.alpha ??= 1;

					if (meta) {
						meta.formatId = formatId;
					}

					return color;
				}
			}
		}
	}


	// If we're here, we couldn't parse
	throw new TypeError(`Could not parse ${str} as a color. Missing a plugin?`);
}
