import { White } from "./adapt.js";
import { ColorConstructor, Coords, ColorTypes } from "./color.js";

export interface Format {
	/** @default "function" */
	type?: string | undefined;
	/** @default "color" */
	name?: string | undefined;
	id?: string | undefined;
	coords?: string[] | undefined;
	coordGrammar?: (string & { range?: [number, number] })[] | undefined;
	serializeCoords?:
	| ((coords: Coords, precision: number) => [string, string, string])
	| undefined;
	/** Whether to adjust the coordinates to fit in the gamut */
	toGamut?: boolean | undefined;
	/** Whether commas should separate arguments for a format */
	commas?: boolean | undefined;
	/** Whether the last coordinate is the alpha coordinate */
	lastAlpha?: boolean | undefined;
	/** Whether the format has an alpha channel */
	noAlpha?: boolean | undefined;
	test?: ((str: string) => boolean) | undefined;
	/** Function to parse a string into a color */
	parse?: ((str: string) => ColorConstructor) | undefined;
	/**
	 * Serialize coordinates and an alpha channel into a string.
	 * Must be defined for a format to support serialization
	*/
	serialize?: ((coords: Coords, alpha: number, opts?: Record<string, any>) => string) | undefined;
}

export interface CoordMeta {
	name?: string | undefined;
	type?: string | undefined;
	range?: [number, number] | undefined;
	refRange?: [number, number] | undefined;
}

export interface Options {
	/** Id of this space, used in things such as conversions */
	id: string;
	/** The readable name of the space, used in user-facing UI */
	name: string;
	/** The base color space */
	base?: string | ColorSpace | null | undefined;
	/**
	 * Function that converts coords in the base color space to coords in this color space.
	 * Must perform chromatic adaptation if needed
	*/
	fromBase?: ((coords: Coords) => number[]) | undefined;
	/**
	 * Function that converts coords in this color space to coords in the base color space.
	 * Must perform chromatic adaptation if needed
	 */
	toBase?: ((coords: Coords) => number[]) | undefined;
	/**
	 * Object mapping coord ids to coord metadata
	 * @see {@link CoordMeta}
	*/
	coords?: Record<string, CoordMeta> | undefined;
	white?: string | White | undefined;
	/** The ID used by CSS, such as `display-p3` or `--cam16-jmh` */
	cssId?: string | undefined;
	referred?: string | undefined;
	/**
	 * Details about string formats to parse from / serialize to
	 * @see {@link Format}
	*/
	formats?: Record<string, Format> | undefined;
	gamutSpace?: "self" | string | ColorSpace | null | undefined;
}

export type Ref =
	| string
	| [string | ColorSpace, string]
	| { space: string | ColorSpace; coordId: string };

/** Class for color spaces. Each color space corresponds to a `ColorSpace` instance */
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
	/** The ID used by CSS, such as `display-p3` or `--cam16-jmh` */
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

	from (color: ColorTypes): Coords;
	from (space: string | ColorSpace, coords: Coords): Coords;

	getFormat (format?: string | Format): Format | null;

	getMinCoords (): Coords;

	inGamut (coords: Coords, options?: { epsilon?: number }): boolean;

	to (color: ColorTypes): Coords;
	to (space: string | ColorSpace, coords: Coords): Coords;

	toString (): string;
}
