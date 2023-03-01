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
	}
): PlainColorObject;

export default toGamut;
