import { isNone, skipNone } from "./util.js";
import defaults from "./defaults.js";
import to from "./to.js";
import serialize from "./serialize.js";
import clone from "./clone.js";
import REC2020 from "./spaces/rec2020.js";
import P3 from "./spaces/p3.js";
import Lab from "./spaces/lab.js";
import sRGB from "./spaces/srgb.js";

// Default space for CSS output. Code in Color.js makes this wider if there's a DOM available
defaults.display_space = sRGB;

let supportsNone;

if (typeof CSS !== "undefined" && CSS.supports) {
	// Find widest supported color space for CSS
	for (let space of [Lab, REC2020, P3]) {
		let coords = space.getMinCoords();
		let color = {space, coords, alpha: 1};
		let str = serialize(color);

		if (CSS.supports("color", str)) {
			defaults.display_space = space;
			break;
		}
	}
}

/**
 * Returns a serialization of the color that can actually be displayed in the browser.
 * If the default serialization can be displayed, it is returned.
 * Otherwise, the color is converted to Lab, REC2020, or P3, whichever is the widest supported.
 * In Node.js, this is basically equivalent to `serialize()` but returns a `String` object instead.
 *
 * @export
 * @param {{space, coords} | Color | string} color
 * @param {*} [options={}] Options to be passed to serialize()
 * @param {ColorSpace | string} [options.space = defaults.display_space] Color space to use for serialization if default is not supported
 * @returns {String} String object containing the serialized color with a color property containing the converted color (or the original, if no conversion was necessary)
 */
export default function display (color, {space = defaults.display_space, ...options} = {}) {
	let ret = serialize(color, options);

	if (typeof CSS === "undefined" || CSS.supports("color", ret) || !defaults.display_space) {
		ret = new String(ret);
		ret.color = color;
	}
	else {
		// If we're here, what we were about to output is not supported
		let fallbackColor = color;

		// First, check if the culprit is none values
		let hasNone = color.coords.some(isNone) || isNone(color.alpha);

		if (hasNone) {
			// Does the browser support none values?
			if (!(supportsNone ??= CSS.supports("color", "hsl(none 50% 50%)"))) {
				// Nope, try again without none
				fallbackColor = clone(color);
				fallbackColor.coords = fallbackColor.coords.map(skipNone);
				fallbackColor.alpha = skipNone(fallbackColor.alpha);

				ret = serialize(fallbackColor, options);

				if (CSS.supports("color", ret)) {
					// We're done, now it's supported
					ret = new String(ret);
					ret.color = fallbackColor;
					return ret;
				}
			}
		}

		// If we're here, the color function is not supported
		// Fall back to fallback space
		fallbackColor = to(fallbackColor, space);
		ret = new String(serialize(fallbackColor, options));
		ret.color = fallbackColor;
	}

	return ret;
}
