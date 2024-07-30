import * as util from "./util.js";
import ColorSpace from "./ColorSpace.js";
import defaults from "./defaults.js";
import getColor from "./getColor.js";
import to from "./to.js";
import checkInGamut from "./inGamut.js";
import toGamut from "./toGamut.js";
import clone from "./clone.js";

// Type "imports"
/** @typedef {import("./types.js").ColorTypes} ColorTypes */
/** @typedef {import("./types.js").SerializeOptions} SerializeOptions */

/**
 * Generic toString() method, outputs a color(spaceId ...coords) function, a functional syntax, or custom formats defined by the color space
 * @param {ColorTypes} color
 * @param {SerializeOptions & Record<string, any>} options
 * @returns {string}
 */
export default function serialize (color, options = {}) {
	let {
		precision = defaults.precision,
		format,
		inGamut = true,
		coords: coordFormat,
		alpha: alphaFormat,
		commas,
	} = options;
	let ret;

	color = getColor(color);

	let formatId = format;

	if (color.parseMeta && !format) {
		if (color.parseMeta.format.canSerialize()) {
			format = color.parseMeta.format;
			formatId = color.parseMeta.formatId;
		}

		coordFormat ??= color.parseMeta.types;
		alphaFormat ??= color.parseMeta.alphaType;
		commas ??= color.parseMeta.commas;
	}

	if (formatId) {
		// A format is explicitly specified
		format = color.space.getFormat(format) ?? ColorSpace.findFormat(formatId);
	}

	if (!format) {
		// No format specified, or format not found
		format = color.space.getFormat("default") ?? ColorSpace.DEFAULT_FORMAT;
		formatId = format.name;
	}

	if (format && format.space && format.space !== color.space) {
		// Format specified belongs to a different color space,
		// need to convert to it first
		color = to(color, format.space);
	}

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
		if (format.serialize) {
			ret = format.serialize(coords, color.alpha, options);
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

		// Serialize alpha?
		/** @type {string | number} */
		let alpha = color.alpha;

		if (alphaFormat !== undefined && !(typeof alphaFormat === "object")) {
			alphaFormat = typeof alphaFormat === "string" ? {type: alphaFormat} : {include: alphaFormat};
		}

		let alphaType = alphaFormat?.type ?? "<number>";
		let serializeAlpha = alphaFormat?.include === true || format.alpha === true || (alphaFormat?.include !== false && format.alpha !== false && alpha < 1);
		let strAlpha = "";

		commas ??= format.commas;

		if (serializeAlpha) {
			if (precision !== null) {
				let unit;

				if (alphaType === "<percentage>") {
					unit = "%";
					alpha *= 100;
				}

				alpha = util.serializeNumber(alpha, {precision, unit});
			}

			strAlpha = `${ commas ? "," : " /" } ${alpha}`;
		}

		ret = `${ name }(${ args.join(commas ? ", " : " ") }${ strAlpha })`;
	}

	return ret;
}
