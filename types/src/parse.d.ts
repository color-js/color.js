import { PlainColorObject } from "./color";

export interface Options {
	meta?: object | undefined;
}

export default function parse(
	str: string,
	options?: Options & Record<string, any>
): PlainColorObject;
