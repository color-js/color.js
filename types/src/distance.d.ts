import Color, { ColorObject } from "./color.js";
import ColorSpace from "./space.js";

export default function distance (
	color1: Color | ColorObject,
	color2: Color | ColorObject,
	space?: string | ColorSpace
): number;
