import { ColorTypes, Coords } from "./color.js";
import ColorSpace from "./ColorSpace.js";

export default function getAll (
	color: ColorTypes,
	space?: string | ColorSpace,
	precision?: number
): Coords;

export default function getAll (
	color: ColorTypes,
	precision?: number
): Coords;
