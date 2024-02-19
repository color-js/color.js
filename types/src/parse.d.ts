import { ColorConstructor } from "./color.js";

export interface Options {
	meta?: object | undefined;
}

/**
 * Parse a string as a color.
 * Understands all {@link https://www.w3.org/TR/css-color-4/ CSS Color 4} functions.
 * Uses the DOM if present to parse hex colors and color names,
 * so that will not available in non-DOM environments such as Node.js
 */
export default function parse (
	str: string,
	options?: Options & Record<string, any>
): ColorConstructor;
