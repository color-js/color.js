import { ColorTypes, PlainColorObject } from "./color.js";
import { Ref } from "./space.js";

declare namespace set {
	let returns: "color";
}

declare function set (
	color: ColorTypes,
	prop: Ref,
	value: number | ((coord: number) => number)
): PlainColorObject;
declare function set (
	color: ColorTypes,
	props: Record<string, number | ((coord: number) => number)>
): PlainColorObject;

export default set;
