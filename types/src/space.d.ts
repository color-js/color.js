import { White } from "./adapt.js";
import Color, { ColorConstructor, ColorObject, Coords } from "./color.js";

export interface Format {
	type?: string | undefined;
	name?: string | undefined;
	id?: string | undefined;
	coords?: string[] | undefined;
	coordGrammar?: (string & { range?: [number, number] })[] | undefined;
	serializeCoords?:
	| ((coords: Coords, precision: number) => [string, string, string])
	| undefined;
	toGamut?: boolean | undefined;
	commas?: boolean | undefined;
	lastAlpha?: boolean | undefined;
	noAlpha?: boolean | undefined;
	test?: ((str: string) => boolean) | undefined;
	parse?: ((str: string) => ColorConstructor) | undefined;
	serialize?: ((coords: Coords, alpha: number, opts?: Record<string, any>) => string) | undefined;
}

export interface CoordMeta {
	name?: string | undefined;
	type?: string | undefined;
	range?: [number, number] | undefined;
	refRange?: [number, number] | undefined;
}

export interface Options {
	id: string;
	name: string;
	base?: string | ColorSpace | null | undefined;
	fromBase?: ((coords: Coords) => number[]) | undefined;
	toBase?: ((coords: Coords) => number[]) | undefined;
	coords?: Record<string, CoordMeta> | undefined;
	white?: string | White | undefined;
	cssId?: string | undefined;
	referred?: string | undefined;
	formats?: Record<string, Format> | undefined;
	gamutSpace?: "self" | string | ColorSpace | null | undefined;
}

export type Ref =
	| string
	| [string | ColorSpace, string]
	| { space: string | ColorSpace; coordId: string };

export default class ColorSpace {
	constructor (options: Options);

	static DEFAULT_FORMAT: { type: "functions"; name: "color" };

	/**
	 * @throws {TypeError} If no matching color space is found
	 */
	static get (
		space: ColorSpace | string,
		...alternatives: (ColorSpace | string)[]
	): ColorSpace;

	/**
	 * @throws {TypeError} If no space or an unknown space is provided
	 */
	static resolveCoord (
		ref: Ref,
		workingSpace?: string | ColorSpace
	): CoordMeta & {
		id: string;
		index: string | number;
		space: ColorSpace;
	};

	/**
	 * @throws {TypeError} If a space with the provided id already exists
	 */
	static register (space: ColorSpace): ColorSpace;
	static register (id: string, space: ColorSpace): ColorSpace;

	static registry: Record<string, ColorSpace>;

	get all (): Set<ColorSpace>;
	get cssId (): string;
	get isPolar (): boolean;

	name: string;
	id: string;
	aliases?: string[] | undefined;
	base: ColorSpace | null;
	coords: Record<string, CoordMeta>;
	fromBase?: ((coords: Coords) => number[]) | undefined;
	toBase?: ((coords: Coords) => number[]) | undefined;
	formats: Record<string, Format>;
	referred?: string | undefined;
	white: White;
	gamutSpace: ColorSpace;

	from (color: Color | ColorObject): Coords;
	from (space: string | ColorSpace, coords: Coords): Coords;

	getFormat (format?: string | Format): Format | null;

	getMinCoords (): Coords;

	inGamut (coords: Coords, options?: { epsilon?: number }): boolean;

	to (color: Color | ColorObject): Coords;
	to (space: string | ColorSpace, coords: Coords): Coords;

	toString (): string;
}
