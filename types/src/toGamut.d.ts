import { ColorTypes, PlainColorObject } from "./color.js";
import { Methods } from "./deltaE/index.js";
import ColorSpace, { Ref } from "./space.js";

export interface Options {
	/**
	 * How to force into gamut.
	 *
	 * If `"clip"`, coordinates are just clipped to their reference range.\
	 * If `"css"`, coordinates are reduced according to the CSS 4 Gamut Mapping Algorithm.\
	 * If in the form `[colorSpaceId].[coordName]`, that coordinate is reduced
	 * until the color is in gamut. Please note that this may produce nonsensical
	 * results for certain coordinates (e.g. hue) or infinite loops
	 * if reducing the coordinate never brings the color in gamut
	 * @default "css"
	 */
	method?: "css" | "clip" | (string & {}) | undefined;
	/** The color whose space is being mapped to. Defaults to the current space */
	space?: string | ColorSpace | undefined;
	deltaEMethod?: Methods | undefined;
	/** The "just noticeable difference" to target */
	jnd?: number | undefined;
	/**
	 * Used to configure SDR black and clamping.
	 * `channel` indicates the `space.channel` to use for determining when to clamp.
	 * `min` indicates the lower limit for black clamping and `max` indicates the upper
	 * limit for white clamping
	 */
	blackWhiteClamp?: { channel: Ref; min: number; max: number } | undefined;
}

declare namespace toGamut {
	let returns: "color";
}

declare function toGamut (color: ColorTypes, options?: Options | string): PlainColorObject;

export default toGamut;

export function toGamutCSS (
	color: ColorTypes,
	options?: {
		space?: string | ColorSpace | undefined;
	}
): PlainColorObject;
