import Color, { ColorTypes, PlainColorObject } from "./color.js";
import ColorSpace from "./space.js";
import { Methods } from "./deltaE/index.js";

export type Range = ((percentage: number) => Color) & {
	rangeArgs: { colors: [Color, Color]; options: Record<string, any> };
};

export function isRange(val: any): val is Range;

export interface RangeOptions {
	space?: string | ColorSpace | undefined;
	outputSpace?: string | ColorSpace | undefined;
	progression?: ((percentage: number) => number) | undefined;
	premultiplied?: boolean | undefined;
	hue?: "longer" | "shorter" | "increasing" | "decreasing" | "raw" | undefined;
}

export function range(range: Range, options?: RangeOptions): Range;
export function range(
	color1: ColorTypes,
	color2: ColorTypes,
	options?: RangeOptions & Record<string, any>
): Range;

// tslint:disable-next-line:no-empty-interface
export interface MixOptions extends RangeOptions {}

export function mix(
	color1: ColorTypes,
	color2: ColorTypes,
	options?: MixOptions
): PlainColorObject;
export function mix(
	color1: ColorTypes,
	color2: ColorTypes,
	p: number,
	options?: MixOptions
): PlainColorObject;

export interface StepsOptions extends RangeOptions {
	maxDeltaE?: number | undefined;
	deltaEMethod?: Methods | undefined;
	steps?: number | undefined;
	maxSteps?: number | undefined;
}

export function steps(color1: ColorTypes, color2: ColorTypes, options?: StepsOptions): PlainColorObject[];
export function steps(range: Range, options?: StepsOptions): PlainColorObject[];

export function register(color: typeof Color): void;
