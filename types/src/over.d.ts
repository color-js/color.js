import Color, { ColorTypes } from "./color";

export interface OverOptions {
	space?: string | ColorSpace | undefined;
	outputSpace?: string | ColorSpace | undefined;
}

export function over(
	source: ColorTypes,
	backdrop: ColorTypes,
	options?: OverOptions
) : ColorTypes