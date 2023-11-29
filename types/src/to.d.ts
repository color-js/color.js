import { PlainColorObject, ColorTypes } from "./color.js";
import ColorSpace from "./space.js";

declare namespace to {
	let returns: "color";
}

declare function to (
	color: ColorTypes,
	space: string | ColorSpace,
	options?: { inGamut?: boolean | undefined }
): PlainColorObject;

export default to;
