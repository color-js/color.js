import * as util from "./util.js";
import ColorSpace from "./space.js";
import defaults from "./defaults.js";
import getColor from "./getColor.js";
import to from "./to.js";
import checkInGamut from "./inGamut.js";
import toGamut from "./toGamut.js";
import clone from "./clone.js";

/**
 * Generic toString() method, outputs a color(spaceId ...coords) function, a functional syntax, or custom formats defined by the color space
 * @param {Object} options
 * @param {number} options.precision - Significant digits
 * @param {boolean} options.inGamut - Adjust coordinates to fit in gamut first? [default: false]
 */
export default function serialize (color, {
	precision = defaults.precision,
	format = "default",
	inGamut = true,
	...customOptions
} = {}) {
	let ret;

	color = getColor(color);

	let formatId = format;
	format = color.space.getFormat(format)
		   ?? color.space.getFormat("default")
		   ?? ColorSpace.DEFAULT_FORMAT;

	inGamut ||= format.toGamut;

	let coords = color.coords;

	// Convert NaN to zeros to have a chance at a valid CSS color
	// Also convert -0 to 0
	// This also clones it so we can manipulate it
	coords = coords.map(c => c? c : 0);

	if (inGamut && !checkInGamut(color)) {
		coords = toGamut(clone(color), inGamut === true? undefined : inGamut).coords;
	}

	if (format.type === "custom") {
		customOptions.precision = precision;

		if (format.serialize) {
			ret = format.serialize(coords, color.alpha, customOptions);
		}
		else {
			throw new TypeError(`format ${formatId} can only be used to parse colors, not for serialization`);
		}
	}
	else {
		// Functional syntax
		let name = format.name || "color";

		if (format.serializeCoords) {
			coords = format.serializeCoords(coords, precision);
		}
		else {
			if (precision !== null) {
				coords = coords.map(c => util.toPrecision(c, precision));
			}
		}

		let args = [...coords];

		if (name === "color") {
			// If output is a color() function, add colorspace id as first argument
			let cssId = format.id || format.ids?.[0] || color.space.id;
			args.unshift(cssId);
		}

		let alpha = color.alpha;
		if (precision !== null) {
			alpha = util.toPrecision(alpha, precision);
		}

		let strAlpha = color.alpha < 1 && !format.noAlpha? `${format.commas? "," : " /"} ${alpha}` : "";
		ret = `${name}(${args.join(format.commas? ", " : " ")}${strAlpha})`;
	}

	return ret;
}
