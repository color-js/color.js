import Color, { ColorObject } from "./color.js";
import ColorSpace from "./space.js";

export default function setAll<T extends Color | ColorObject>(
	color: T,
	space: string | ColorSpace,
	coords: [number, number, number]
): T;
