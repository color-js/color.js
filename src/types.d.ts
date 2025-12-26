/**
 * @packageDocumentation
 * Defines and re-exports many types for use throughout the library.
 */

// muliply-matricies.js
export type Matrix3x3 = [
	[number, number, number],
	[number, number, number],
	[number, number, number],
];
export type Vector3 = [number, number, number];

// contrast/
export type * from "./contrast/index.js";

// deltaE/
import type { Methods } from "./deltaE/index.js";
export type * from "./deltaE/index.js";

// adapt.js
export type White = [number, number, number];

// CATs.js
export interface CAT {
	id: string;
	toCone_M: number[][];
	fromCone_M: number[][];
}

// ColorSpace.js
import type { default as ColorSpace } from "./ColorSpace.js";
export type { ColorSpace };

export interface FormatObject {
	/** @default "function" */
	type?: string | undefined;
	/** @default "color" */
	name?: string | undefined;
	id?: string | undefined;
	ids?: string[] | undefined;
	coords?: string[] | undefined;
	coordGrammar?: (string & { range?: [number, number] })[] | undefined;
	space?: ColorSpace | undefined;
	serializeCoords?: ((coords: Coords, precision: number) => [string, string, string]) | undefined;
	/** Whether to adjust the coordinates to fit in the gamut */
	toGamut?: boolean | undefined;
	/** Whether commas should separate arguments for a format */
	commas?: boolean | undefined;
	/** Whether to always have alpha at the end (true), never (false), or auto (undefined) */
	alpha?: boolean | undefined;
	test?: ((str: string) => boolean) | undefined;
	/** Function to parse a string into a color */
	parse?: ((str: string) => ColorConstructor | undefined | null) | undefined;
	/**
	 * Serialize coordinates and an alpha channel into a string.
	 * Must be defined for a format to support serialization
	 */
	serialize?: ((coords: Coords, alpha: number, opts?: Record<string, any>) => string) | undefined;
	[instance]?: FormatClass | undefined;
}

export interface CoordMeta {
	name?: string | undefined;
	type?: string | undefined;
	range?: [number, number] | undefined;
	refRange?: [number, number] | undefined;
}

export interface SpaceOptions {
	/** Id of this space, used in things such as conversions */
	id: string;
	/** The readable name of the space, used in user-facing UI */
	name: string;
	/** The base color space */
	base?: string | ColorSpace | null | undefined;
	/**
	 * Function that converts coords in the base color space to coords in this color space.
	 * Must perform chromatic adaptation if needed
	 */
	fromBase?: ((coords: Coords) => number[]) | undefined;
	/**
	 * Function that converts coords in this color space to coords in the base color space.
	 * Must perform chromatic adaptation if needed
	 */
	toBase?: ((coords: Coords) => number[]) | undefined;
	/**
	 * Object mapping coord ids to coord metadata
	 * @see {@link CoordMeta}
	 */
	coords?: Record<string, CoordMeta> | undefined;
	white?: string | White | undefined;
	/** The ID used by CSS, such as `display-p3` or `--cam16-jmh` */
	cssId?: string | undefined;
	referred?: string | undefined;
	/**
	 * Details about string formats to parse from / serialize to
	 * @see {@link FormatObject}
	 */
	formats?: Record<string, FormatObject> | undefined;
	gamutSpace?: "self" | string | ColorSpace | null | undefined;
	aliases?: string[] | undefined;
	ε?: number | undefined;
}

export type Ref =
	| string
	| [string | ColorSpace, string]
	| { space: string | ColorSpace; coordId: string };

// color.js
// Since color.js is one of the few files to have a `.d.ts` (due to its complexity),
// its types are defined in that file and just re-exported here
import type Color from "./color.js";
import type { ColorConstructor, Coords, PlainColorObject } from "./color.js";
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

import type { default as FormatClass, instance } from "./Format.js";

/** Metadata stored on Color objects */
export interface ParseMeta {
	format?: FormatClass | undefined;
	formatId?: string;
	name?: string;
	types?: (string | undefined)[];
	commas?: boolean;
	alphaType?: "<number>" | "<percentage>" | undefined;
}

export interface ParseOptions {
	/** Object to hold information about the parsing (format, types, etc.) */
	meta?: ParseMeta | undefined;
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
	format?: string | FormatObject | undefined;
	/**
	 * Adjust coordinates to fit in gamut first
	 * @default false
	 */
	inGamut?: boolean | undefined;
	/** Coordinate format to override the default */
	coords?: (string | undefined)[];
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

// tryColor.js
export interface TryColorOptions extends ParseOptions {
	/**
	 * CSS property to use for DOM resolution
	 * Defaults to `"background-color"`.
	 * Why not use `color` as the default? Because then `currentColor` would resolve to the parent color.
	 **/
	cssProperty?: string;
	/** DOM element to use for CSS resolution */
	element?: Element;
	/** Object to hold error metadata if resolution fails */
	errorMeta?: Record<any, any>;
}

// cam16.js
export type LightnessOrBrightness = { J: number; Q?: never } | { J?: never; Q: number };
export type ChromaOrColorfulnessOrSaturation =
	| { C: number; M?: never; s?: never }
	| { C?: never; M: number; s?: never }
	| { C?: never; M?: never; s: number };
export type HueOrHueQuadrature = { h: number; H?: never } | { h?: never; H: number };
export type Cam16Input = LightnessOrBrightness &
	ChromaOrColorfulnessOrSaturation &
	HueOrHueQuadrature;

export interface Cam16Object {
	J: number;
	C: number;
	h: number;
	s: number;
	Q: number;
	M: number;
	H: number;
}

export interface Cam16Environment {
	discounting: boolean;
	refWhite: [number, number, number];
	surround: "dark" | "dim" | "average";
	la: number;
	yb: number;
	c: number;
	nc: number;
	fl: number;
	flRoot: number;
	n: number;
	z: number;
	nbb: number;
	ncb: number;
	dRgb: [number, number, number];
	dRgbInv: [number, number, number];
	aW: number;
}
