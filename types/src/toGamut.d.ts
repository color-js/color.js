import Color, { ColorObject } from "./color";
import ColorSpace from "./space";

declare namespace toGamut {
	let returns: "color";
}

declare function toGamut<T extends Color | ColorObject>(
	color: T,
	options?: {
		method?: string | undefined;
		space?: string | ColorSpace | undefined;
	}
): T;

export default toGamut;
