import { isString } from "./util.js";
import getColor from "./getColor.js";

/** @import { ColorTypes, PlainColorObject } from "./types.js" */

// Type re-exports
/** @typedef {import("./types.js").TryColorOptions} TryColorOptions */

/**
 * Resolves a color reference (object or string) to a plain color object, or `null` if resolution fails.
 * Can resolve more complex CSS colors (e.g. relative colors, `calc()`, CSS variables, `color-mix()`, etc.) through the DOM.
 *
 * @overload
 * @param {ColorTypes} color
 * @param {TryColorOptions} [options]
 * @returns {PlainColorObject | null}
 */
/**
 * @overload
 * @param {ColorTypes[]} color
 * @param {TryColorOptions} [options]
 * @returns {(PlainColorObject | null)[]}
 */
export default function tryColor (color, options = {}) {
	if (Array.isArray(color)) {
		return color.map(c => tryColor(c, options));
	}

	let { cssProperty = "background-color", element, ...getColorOptions } = options;
	let error = null;
	try {
		return getColor(color, getColorOptions);
	}
	catch (e) {
		error = e;
	}

	let { CSS, getComputedStyle } = globalThis;
	if (isString(color) && element && CSS && getComputedStyle) {
		// Try resolving the color using the DOM, if supported in CSS
		if (CSS.supports(cssProperty, color)) {
			let previousValue = element.style[cssProperty];

			if (color !== previousValue) {
				element.style[cssProperty] = color;
			}

			let computedColor = getComputedStyle(element).getPropertyValue(cssProperty);

			if (color !== previousValue) {
				element.style[cssProperty] = previousValue;
			}

			if (computedColor !== color) {
				// getComputedStyle() changed the color, try again
				try {
					return getColor(computedColor, getColorOptions);
				}
				catch (e) {
					error = e;
				}
			}
			else {
				// Still not resolved
				error = {
					message: "Color value is a valid CSS color, but it could not be resolved :(",
				};
			}
		}
	}

	// If we're here, we failed to resolve the color
	if (options.errorMeta) {
		options.errorMeta.error = error;
	}

	return null;
}
