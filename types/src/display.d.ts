import { PlainColorObject, ColorTypes } from "./color.js";
import ColorSpace from "./space.js";

export type Display = string & { color: PlainColorObject };

/**
 * Returns a serialization of the color that can actually be displayed in the browser.
 * If the default serialization can be displayed, it is returned.
 * Otherwise, the color is converted to Lab, REC2020, or P3, whichever is the widest supported.
 * In Node.js, this is basically equivalent to `serialize()` but returns a `String` object instead
 */
export default function display (
	color: ColorTypes,
	options?: {
		space?: string | ColorSpace | undefined;
	} & Record<string, any>
): Display;
