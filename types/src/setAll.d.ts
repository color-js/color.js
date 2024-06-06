import { ColorTypes, PlainColorObject } from "./color.js";
import ColorSpace from "./ColorSpace.js";

declare namespace setAll {
	let returns: "color";
}

declare function setAll (
	color: ColorTypes,
	coords: [number, number, number],
	alpha?: number | undefined
): PlainColorObject;

declare function setAll (
	color: ColorTypes,
	space: string | ColorSpace,
	coords: [number, number, number],
	alpha?: number | undefined
): PlainColorObject;

export default setAll;
