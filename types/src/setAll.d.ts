import { ColorTypes, PlainColorObject } from "./color.js";
import ColorSpace from "./space.js";

declare namespace setAll {
	let returns: "color";
}

declare function setAll (
	color: ColorTypes,
	space: string | ColorSpace,
	coords: [number, number, number]
): PlainColorObject;

export default setAll;
