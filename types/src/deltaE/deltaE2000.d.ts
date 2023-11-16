import Color, { ColorObject } from "../color.js";

export default function (
	color: Color | ColorObject,
	sample: Color | ColorObject,
	options?: {
		kL?: number | undefined;
		kC?: number | undefined;
		kH?: number | undefined;
	},
): number;
