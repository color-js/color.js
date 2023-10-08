import { ColorConstructor } from "./color.js";

export interface Options {
	meta?: object | undefined;
}

export default function parse(
	str: string,
	options?: Options & Record<string, any>
): ColorConstructor;
