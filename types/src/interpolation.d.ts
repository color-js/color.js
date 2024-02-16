import Color, { ColorTypes, PlainColorObject } from "./color.js";
import ColorSpace from "./space.js";
import { Methods } from "./deltaE/index.js";

export type Range = ((percentage: number) => Color) & {
	rangeArgs: { colors: [Color, Color]; options: Record<string, any> };
};

export function isRange (val: any): val is Range;

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

/**
 * Creates a function that accepts a number and returns a color.
 * For numbers in the range 0 to 1, the function interpolates;
 * for numbers outside that range, the function extrapolates
 * (and thus may not return the results you expect)
 */
export function range (range: Range, options?: RangeOptions): Range;
export function range (
	color1: ColorTypes,
	color2: ColorTypes,
	options?: RangeOptions & Record<string, any>
): Range;

export type MixOptions = RangeOptions;

/** Create color mixtures in any desired proportion between two colors */
export function mix (
	color1: ColorTypes,
	color2: ColorTypes,
	options?: MixOptions
): PlainColorObject;
export function mix (
	color1: ColorTypes,
	color2: ColorTypes,
	p: number,
	options?: MixOptions
): PlainColorObject;

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

/** Get an array of discrete steps */
export function steps (color1: ColorTypes, color2: ColorTypes, options?: StepsOptions): PlainColorObject[];
export function steps (range: Range, options?: StepsOptions): PlainColorObject[];

export function register (color: typeof Color): void;
