import * as util from "./util.js";
import ColorSpace from "./space.js";
import defaults from "./defaults.js";

const hasDOM = typeof document !== "undefined";

/**
 * Generic toString() method, outputs a color(spaceId ...coords) function, a functional syntax, or custom formats defined by the color space
 * @param {Object} options
 * @param {number} options.precision - Significant digits
 * @param {Function|String|Array} options.serializeCoords - If function, maps all coordinates. Keywords tap to colorspace-specific formats (e.g. "hex")
 * @param {boolean} options.inGamut - Adjust coordinates to fit in gamut first? [default: false]
 * @param {string} options.name - Function name [default: color]
 */
export default function toString (color, {
	precision = defaults.precision,
	format = "default", commas,
	inGamut = true,
	name,
	fallback,
	...customOptions
} = {}) {
	format = color.space.getFormat(format)
		   ?? color.space.getFormat("default")
		   ?? ColorSpace.DEFAULT_FORMAT;

	let ret;

	inGamut ||= format.toGamut;

	let coords = color.coords;

	// Convert NaN to zeros to have a chance at a valid CSS color
	// Also convert -0 to 0
	// This also clones it so we can manipulate it
	coords = coords.map(c => c? c : 0);

	if (inGamut && !color.inGamut()) {
		coords = color.clone().toGamut(inGamut === true? undefined : inGamut).coords;
	}

	if (format.type === "custom") {
		ret = format.serialize(coords, color.alpha, customOptions);
	}
	else {
		// Functional syntax

		name ||= format.name || "color";

		if (format.coordGrammar) {
			Object.entries(color.space.coords).forEach(([id, coordMeta], i) => {
				// Preferred format for each coord is the first one
				let outputType = format.coordGrammar[i][0];

				let fromRange = coordMeta.range || coordMeta.refRange;
				let toRange = outputType.range, suffix = "";

				// Non-strict equals intentional since outputType could be a string object
				if (outputType == "<percentage>") {
					toRange = [0, 100];
					suffix = "%";
				}
				else if (outputType == "<angle>") {
					suffix = "deg";
				}

				if (fromRange && toRange) {
					coords[i] = util.mapRange(fromRange, toRange, coords[i]);
				}

				coords[i] = util.toPrecision(coords[i], precision);

				if (suffix) {
					coords[i] += suffix;
				}
			});
		}
		else {
			if (precision !== null) {
				coords = coords.map(c => util.toPrecision(c, precision));
			}
		}

		let args = [...coords];

		if (name === "color") {
			// If output is a color() function, add colorspace id as first argument
			args.unshift(color.space.cssId);
		}

		let strAlpha = color.alpha < 1? ` ${format.commas? "," : "/"} ${color.alpha}` : "";
		ret = `${name}(${args.join(format.commas? ", " : " ")}${strAlpha})`;
	}

	if (fallback) {
		// Return a CSS string that's actually supported by the current browser
		// Return as a String object, so we can also hang the color object on it
		// in case it's different than this. That way third party code can use that
		// for e.g. computing text color, indicating out of gamut etc

		if (!hasDOM || typeof CSS === "undefined" || CSS.supports("color", ret)) {
			ret = new String(ret);
			ret.color = color;
			return ret;
		}

		let fallbacks = Array.isArray(fallback)? fallback.slice() : defaults.fallbackSpaces;

		for (let i = 0, fallbackSpace; fallbackSpace = fallbacks[i]; i++) {
			if (ColorSpace.registry[fallbackSpace]) {
				let fallbackColor = color.to(fallbackSpace);
				ret = fallbackColor.toString({precision});

				if (CSS.supports("color", ret)) {
					ret = new String(ret);
					ret.color = fallbackColor;
					return ret;
				}
				else if (fallbacks === defaults.fallbackSpaces) {
					// Drop this space from the default fallbacks since it's not supported
					fallbacks.splice(i, 1);
					i--;
				}
			}
		}

		// None of the fallbacks worked, return in the most conservative form possible
		let fallbackColor = color.to("srgb");
		ret = new String(fallbackColor.toString());
		ret.color = fallbackColor;
	}

	return ret;
}