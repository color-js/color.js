import { ColorTypes } from "../color.js";
export default function (
	color: ColorTypes,
	sample: ColorTypes,
	options?: {
		l?: number | undefined;
		c?: number | undefined;
	}
): number;
