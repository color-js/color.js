import { ColorTypes } from "./color.js";
import ColorSpace from "./space.js";

export default function inGamut (
	color: ColorTypes,
	space?: string | ColorSpace,
	options?: { epsilon?: number | undefined }
): boolean;
