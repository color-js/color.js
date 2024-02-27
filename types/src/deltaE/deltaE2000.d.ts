import { ColorTypes } from "../color.js";

export default function (
	color: ColorTypes,
	sample: ColorTypes,
	options?: {
		kL?: number | undefined;
		kC?: number | undefined;
		kH?: number | undefined;
	}
): number;
