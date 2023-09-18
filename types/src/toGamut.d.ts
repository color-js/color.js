import { ColorTypes, PlainColorObject } from "./color";
import ColorSpace from "./space";

declare namespace toGamut {
	let returns: "color";
}

declare function toGamut(
	color: ColorTypes,
	options?: {
		method?: string | undefined;
		space?: string | ColorSpace | undefined;
	} | string
): PlainColorObject;

export default toGamut;
