import { ColorTypes } from "./color.js";
import ColorSpace from "./space.js";

export default function distance (
	color1: ColorTypes,
	color2: ColorTypes,
	space?: string | ColorSpace
): number;
