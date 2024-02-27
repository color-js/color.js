import { ColorTypes, PlainColorObject } from "./color.js";
import { Ref } from "./space.js";

export default function set (
	color: ColorTypes,
	prop: Ref,
	value: number | ((coord: number) => number)
): PlainColorObject;
export default function set (
	color: ColorTypes,
	props: Record<string, number | ((coord: number) => number)>
): PlainColorObject;
