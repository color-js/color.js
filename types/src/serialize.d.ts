import { ColorTypes } from "./color";
import { Format } from "./space";

export interface Options {
	precision?: number | undefined;
	format?: string | Format | undefined;
	inGamut?: boolean | undefined;
}

export default function serialize(
	color: ColorTypes,
	options?: Options & Record<string, any>
): string;
