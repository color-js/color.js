import { ColorTypes } from "./color.js";
import ColorSpace from "./space.js";

export default function getAll (
	color: ColorTypes,
	space?: string | ColorSpace
): [number, number, number];
