import Color, { ColorObject } from "./color.js";
import ColorSpace from "./space.js";

export default function getAll(
	color: Color | ColorObject,
	space: string | ColorSpace,
): [number, number, number];
