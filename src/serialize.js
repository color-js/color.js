import * as util from "./util.js";
import ColorSpace from "./space.js";
import defaults from "./defaults.js";
import getColor from "./getColor.js";
import checkInGamut from "./inGamut.js";
import toGamut from "./toGamut.js";
import clone from "./clone.js";

/**
 * Generic toString() method, outputs a color(spaceId ...coords) function, a functional syntax, or custom formats defined by the color space
 * @param {Object} [options]
 * @param {number} [options.precision] - Significant digits
 * @param {boolean} [options.inGamut=false] - Adjust coordinates to fit in gamut first?
 * @param {string} [options.format="default"] - Output format id, default is "default"
 * @param {string} [options.coords] - Coordinate format to override the default
 * @param {string | boolean | {type: string, include: boolean}} [options.alpha] - Alpha format
 */
export default function serialize (color, {
	precision = defaults.precision,
	format = "default",
	inGamut = true,
	coords: coordFormat,
	alpha: alphaFormat,
	...customOptions
} = {}) {
	let ret;

	color = getColor(color);

	let formatId = format;
	format = color.space.getFormat(format)
	       ?? color.space.getFormat("default")
	       ?? ColorSpace.DEFAULT_FORMAT;

	// The assignment to coords and inGamut needs to stay in the order they are now
	// The order of the assignment was changed as a workaround for a bug in Next.js
	// See this issue for details: https://github.com/color-js/color.js/issues/260

	let coords = color.coords.slice(); // clone so we can manipulate it

	inGamut ||= format.toGamut;

	if (inGamut && !checkInGamut(color)) {
		// FIXME what happens if the color contains none values?
		coords = toGamut(clone(color), inGamut === true ? undefined : inGamut).coords;
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

		let args = format.serializeCoords(coords, precision, coordFormat);

		if (name === "color") {
			// If output is a color() function, add colorspace id as first argument
			let cssId = format.id || format.ids?.[0] || color.space.cssId || color.space.id;
			args.unshift(cssId);
		}

		let alpha = color.alpha;

		if (alphaFormat !== undefined && !(typeof alphaFormat === "object")) {
			alphaFormat = typeof alphaFormat === "string" ? {type: alphaFormat} : {include: alphaFormat};
		}

		let alphaType = alphaFormat?.type ?? "<number>";
		let serializeAlpha = alphaFormat?.include === true || format.alpha === true || (alphaFormat?.include !== false && format.alpha !== false && alpha < 1);
		let strAlpha = "";

		if (serializeAlpha) {
			if (precision !== null) {
				let unit;

				if (alphaType === "<percentage>") {
					unit = "%";
					alpha *= 100;
				}

				alpha = util.serializeNumber(alpha, {precision});
			}

			strAlpha = `${format.commas ? "," : " /"} ${alpha}`;
		}

		ret = `${name}(${args.join(format.commas ? ", " : " ")}${strAlpha})`;
	}

	return ret;
}
