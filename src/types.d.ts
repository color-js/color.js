/**
 * @packageDocumentation
 * Defines and re-exports many types for use throughout the library.
 */

// muliply-matricies.js
export type Matrix3x3 = [[number, number, number], [number, number, number], [number, number, number]];
export type Vector3 = [number, number, number];

// contrast/
export type * from "./contrast/index.js";

// deltaE/
import type {Methods} from "./deltaE/index.js";
export type * from "./deltaE/index.js";

// adapt.js
export type White = [number, number, number];

// CATs.js
export interface CAT {
	id: string;
	toCone_M: number[][];
	fromCone_M: number[][];
}

// color.js
// Since color.js is one of the few files to have a `.d.ts` (due to its complexity),
// its types are defined in that file and just re-exported here
import type Color from "./color.js";
import type { Coords, PlainColorObject } from "./color.js";
export type * from "./color.js";

// display.js
export type Display = string & { color: PlainColorObject };

// interpolation.js
export type Range = ((percentage: number) => Color) & {
	rangeArgs: { colors: [Color, Color]; options: Record<string, any> };
};

export interface RangeOptions {
	/**
	 * The interpolation space.
	 * Colors do not need to be in this space; they will be converted for interpolation
	 * @see {@link <https://colorjs.io/docs/interpolation#ranges>}
	 */
	space?: string | ColorSpace | undefined;
	outputSpace?: string | ColorSpace | undefined;
	/**
	 * Used to customize the progression and make in nonlinear
	 * @example
	 * let r = new Color("lch(50 50 0)").range("lch(90 50 20)");
	 * Color.range(r, { progression: p => p ** 3 });
	 */
	progression?: ((percentage: number) => number) | undefined;
	premultiplied?: boolean | undefined;
	/**
	 * Inspired by the
	 * {@link https://drafts.csswg.org/css-color-5/#hue-adjuster hue-adjuster in CSS Color 5}.
	 */
	hue?: "longer" | "shorter" | "increasing" | "decreasing" | "raw" | undefined;
}

export type MixOptions = RangeOptions;

export interface StepsOptions extends RangeOptions {
	/** max deltaE between consecutive steps */
	maxDeltaE?: number | undefined;
	/** @see {@link Methods} */
	deltaEMethod?: Methods | undefined;
	/** The minimum number of steps */
	steps?: number | undefined;
	/** The maximum number of steps */
	maxSteps?: number | undefined;
}

// parse.js
/** Metadata for a parsed argument */
export interface ArgumentMeta {
	/** The raw argument string */
	raw: string;
	/** The type of the argument, e.g. "<number>", "<angle>", "<percentage>" */
	type: string;
	/** The unit of the argument, if present e.g. "%", "deg" */
	unit: string;
	/** The number value of the argument, for arguments that have a unit */
	unitless: number;
	/** Whether the argument is "none" */
	none: boolean;
}

export interface ParseOptions {
	/** Object to hold information about the parsing (format, types, etc.) */
	meta?: ArgumentMeta | undefined;
	/** Alias for {@link meta} */
	parseMeta?: ParseOptions["meta"];
}

export interface ParseFunctionReturn {
	name: string;
	args: string[];
	argMeta: ArgumentMeta[];
	lastAlpha: boolean;
	rawName: string;
	rawArgs: string;
	commas: boolean;
}

// rgbspace.js
export interface RGBOptions extends SpaceOptions {
	toXYZ_M?: Matrix3x3 | undefined;
	fromXYZ_M?: Matrix3x3 | undefined;
}

// serialize.js
export interface SerializeOptions {
	/** Significant digits */
	precision?: number | undefined;
	/**
	 * Output format id.
	 * Defaults to the parsed format if available (and can serialize),
	 * or the color space default otherwise
	 * @default "default"
	 */
	format?: string | Format | undefined;
	/**
	 * Adjust coordinates to fit in gamut first
	 * @default false
	 */
	inGamut?: boolean | undefined;
	/** Coordinate format to override the default */
	coords?: Coords | undefined;
	/** Alpha format */
	alpha?:
		| "<number>"
		| "<percentage>"
		| boolean
		| {
			type?: "<number>" | "<percentage>" | undefined;
			include?: boolean | undefined;
		}
		| undefined;
	/**
	 * Force commas as a separator
	 * @default false
	 */
	commas?: boolean | undefined;
}

// space.js
import type ColorSpace from "./ColorSpace.js";
import type { Format, Ref, SpaceOptions } from "./ColorSpace.js";
export type { ColorSpace };
export type * from "./ColorSpace.js";

// toGamut.js
export interface ToGamutOptions {
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
	deltaEMethod?: Methods | "" | undefined;
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

export type OKCoeff = [
	[
		// Red
		[number, number], // Limit
		[number, number, number, number, number], // `Kn` coefficients
	],
	[
		// Green
		[number, number], // Limit
		[number, number, number, number, number], // `Kn` coefficients
	],
	[
		// Blue
		[number, number], // Limit
		[number, number, number, number, number], // `Kn` coefficients
	],
];

export interface DeltasReturn {
	space: ColorSpace;
	coords: [number, number, number];
	alpha: number;
}
