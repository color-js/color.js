import { ColorTypes, PlainColorObject } from "./color.js";
import ColorSpace from "./space.js";

declare namespace toGamut {
	let returns: "color";
}

declare function toGamut(
	color: ColorTypes,
	options?:
		| {
				method?: string | undefined;
				space?: string | ColorSpace | undefined;
		  }
		| string,
): PlainColorObject;

export default toGamut;
