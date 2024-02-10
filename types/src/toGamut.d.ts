import { ColorTypes, PlainColorObject } from "./color.js";
import ColorSpace from "./space.js";

declare namespace toGamut {
	let returns: "color";
}

declare function toGamut (
	color: ColorTypes,
	options?: {
		method?: string | undefined;
		space?: string | ColorSpace | undefined;
		deltaEMethod?: string | undefined;
		jnd?: number | undefined;
		blackWhiteClamp?: {
			channel: string;
			min: number;
			max: number;
		} | undefined;
	} | string
): PlainColorObject;

export default toGamut;

export function toGamutCSS (
	color: ColorTypes,
	options?: {
		space?: string | ColorSpace | undefined;
	}
): PlainColorObject;
