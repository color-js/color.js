import { PlainColorObject } from "./color";

export interface Options {
	verbose?: boolean | undefined;
}

export interface VerboseParseResult {
	color: PlainColorObject;
	formatId?: string | undefined;
}

export default function parse(
	str: string,
	options?: Options & Record<string, any>
): (PlainColorObject | VerboseParseResult);
