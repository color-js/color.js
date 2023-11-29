import { PlainColorObject, ColorTypes } from "./color.js";
import ColorSpace from "./space.js";

export type Display = string & { color: PlainColorObject };

export default function display (
	color: ColorTypes,
	options?: {
		space?: string | ColorSpace | undefined;
	} & Record<string, any>
): Display;
