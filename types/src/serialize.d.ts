import { ColorTypes } from "./color.js";
import { Format } from "./space.js";

export interface Options {
	precision?: number | undefined;
	format?: string | Format | undefined;
	inGamut?: boolean | undefined;
}

export default function serialize (
	color: ColorTypes,
	options?: Options & Record<string, any>
): string;
