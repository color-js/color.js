/**
 * @packageDocumentation
 * This module defines the main {@link Color} class as well as the types it uses.
 */
import { WHITES } from "./adapt.js";
import defaults from "./defaults.js";
import hooks from "./hooks.js";
import * as util from "./util.js";
import ColorSpace, { Ref } from "./ColorSpace.js";
import SpaceAccessors from "./space-coord-accessors.js";
import { ToGamutOptions } from "./types.js";

import {
	to as toFn,
	parse,
	serialize,
	inGamut as inGamutFn,
	toGamut as toGamutFn,
	distance as distanceFn,
	equals as equalsFn,
	get,
	getAll as getAllFn,
	display,
} from "./index-fn.js";

import { uv, xy } from "./chromaticity.js";
import contrast from "./contrast.js";
import {
	contrastWCAG21,
	contrastAPCA,
	contrastMichelson,
	contrastWeber,
	contrastLstar,
	contrastDeltaPhi,
} from "./contrast/index.js";
import deltaE from "./deltaE.js";
import deltaEMethods, {
	deltaE76,
	deltaECMC,
	deltaE2000,
	deltaEJz,
	deltaEITP,
	deltaEOK,
} from "./deltaE/index.js";
import { range, Range, MixOptions, StepsOptions } from "./interpolation.js";
import { getLuminance } from "./luminance.js";
import { lighten, darken } from "./variations.js";

export type { SpaceAccessor } from "./space-coord-accessors.js";

export type Coords = [number | null, number | null, number | null];

export interface ColorObject {
	spaceId?: string | ColorSpace | undefined;
	space?: string | ColorSpace | undefined;
	coords: Coords;
	alpha?: number | undefined;
}

export interface PlainColorObject {
	space: ColorSpace;
	coords: Coords;
	alpha: number;
}

export interface ColorConstructor {
	spaceId: string;
	coords: Coords;
	alpha: number | undefined;
}

export type ColorTypes = ColorObject | ColorConstructor | string | PlainColorObject;

export type DefineFunctionCode = (...args: any[]) => any;

export interface DefineFunctionOptions {
	instance?: boolean | undefined;
	returns?: "color" | "function<color>" | "array<color>" | undefined;
}

export type DefineFunctionHybrid = DefineFunctionCode & DefineFunctionOptions;

/** Remove the first element of an array type */
type RemoveFirstElement<T extends any[]> = T extends [any, ...infer R]
	? R
	: T[number][];

/** Convert a function to a prototype for Color */
export type ToColorPrototype<T extends (...args: any[]) => any> = T extends (
	color: Color,
	...args: infer A
) => infer R
	? T extends { returns: "color" }
		? (...args: A) => Color
		: (...args: A) => R
	: never;

/** Convert a function to a Color namespace property (returning a Color) */
export type ToColorNamespace<T extends (...args: any[]) => any> = T extends (
	...args: infer A
) => infer R
	? T extends { returns: "color" }
		? (...args: A) => Color
		: (...args: A) => R
	: never;

declare namespace Color {
	// Functions defined using Color.defineFunctions
	export const getAll: ToColorNamespace<typeof getAllFn>;
	export const to: ToColorNamespace<typeof toFn>;
	export const equals: ToColorNamespace<typeof equalsFn>;
	export const inGamut: ToColorNamespace<typeof inGamutFn>;
	export const distance: ToColorNamespace<typeof distanceFn>;
	// `get` is defined below as a static method on the Class,
	// and `toString` is intentionally not overridden for the namespace

	export { util, hooks, WHITES, ColorSpace as Space, parse, defaults };
	export const spaces: typeof ColorSpace["registry"];

	// Must be manually defined due to overloads
	// These should always match the signature of the original function
	export function set (color: ColorTypes, prop: Ref, value: number | ((coord: number) => number)): Color;
	export function set (color: ColorTypes, props: Record<string, number | ((coord: number) => number)>): Color;
	export function setAll (color: ColorTypes, coords: Coords, alpha?: number): Color;
	export function setAll (color: ColorTypes, space: string | ColorSpace, coords: Coords, alpha?: number): Color;
	export function toGamut (color: ColorTypes, options?: ToGamutOptions): Color;
	export function toGamut (color: ColorTypes, space?: string): Color;
}

/**
 * Class that represents a single color.
 * All of Color.js’s tree-shakeable methods are also available as instance methods on this class,
 * as well as static methods that take the color as the first argument.
 */
declare class Color extends SpaceAccessors implements PlainColorObject {
	constructor (color: ColorTypes);
	constructor (space: string | ColorSpace, coords: Coords, alpha?: number);

	// These signatures should always be the same as the constructor
	static get (color: ColorTypes): Color;
	static get (
		space: string | ColorSpace,
		coords: Coords,
		alpha: number
	): Color;

	static defineFunction (name: string, code: DefineFunctionHybrid): void;
	static defineFunction (
		name: string,
		code: DefineFunctionCode,
		options: DefineFunctionOptions
	): void;

	static defineFunctions (objects: Record<string, DefineFunctionHybrid>): void;

	static extend (
		exports:
		| { register: (color: typeof Color) => void }
		| Record<string, DefineFunctionHybrid>
	): void;

	get space (): ColorSpace;
	get spaceId (): string;

	alpha: number;
	coords: Coords;

	clone (): this;

	// Copy parameter types from display function, except for the first one
	display (
		...args: RemoveFirstElement<Parameters<typeof display>>
	): string & { color: Color };

	toJSON (): ColorConstructor;

	// Functions defined using Color.defineFunctions
	get: ToColorPrototype<typeof get>;
	getAll: ToColorPrototype<typeof getAllFn>;
	to: ToColorPrototype<typeof toFn>;
	equals: ToColorPrototype<typeof equalsFn>;
	inGamut: ToColorPrototype<typeof inGamutFn>;
	distance: ToColorPrototype<typeof distanceFn>;
	toString: ToColorPrototype<typeof serialize>;

	// Must be manually defined due to overloads
	// These should always match the signature of the original function
	set (prop: Ref, value: number | ((coord: number) => number)): Color;
	set (props: Record<string, number | ((coord: number) => number)>): Color;
	setAll (coords: Coords, alpha?: number): Color;
	setAll (space: string | ColorSpace, coords: Coords, alpha?: number): Color;
	toGamut (options?: ToGamutOptions): Color;
	toGamut (space?: string): Color;

	/*
	 * ==========================================
	 * Types for properties defined in `index.js`
	 * ==========================================
	 */
	// chromaticity
	uv: ToColorPrototype<typeof uv>;
	xy: ToColorPrototype<typeof xy>;

	// contrast
	contrast: ToColorPrototype<typeof contrast>;
	static contrast: typeof contrast;

	// contrastMethods
	contrastWCAG21: ToColorPrototype<typeof contrastWCAG21>;
	contrastAPCA: ToColorPrototype<typeof contrastAPCA>;
	contrastMichelson: ToColorPrototype<typeof contrastMichelson>;
	contrastWeber: ToColorPrototype<typeof contrastWeber>;
	contrastLstar: ToColorPrototype<typeof contrastLstar>;
	contrastDeltaPhi: ToColorPrototype<typeof contrastDeltaPhi>;

	static contrastWCAG21: typeof contrastWCAG21;
	static contrastAPCA: typeof contrastAPCA;
	static contrastMichelson: typeof contrastMichelson;
	static contrastWeber: typeof contrastWeber;
	static contrastLstar: typeof contrastLstar;
	static contrastDeltaPhi: typeof contrastDeltaPhi;

	// deltaE
	deltaE: ToColorPrototype<typeof deltaE>;
	deltaE76: ToColorPrototype<typeof deltaE76>;
	deltaECMC: ToColorPrototype<typeof deltaECMC>;
	deltaE2000: ToColorPrototype<typeof deltaE2000>;
	deltaEJz: ToColorPrototype<typeof deltaEJz>;
	deltaEITP: ToColorPrototype<typeof deltaEITP>;
	deltaEOK: ToColorPrototype<typeof deltaEOK>;

	static deltaE: typeof deltaE;
	static deltaE76: typeof deltaE76;
	static deltaECMC: typeof deltaECMC;
	static deltaE2000: typeof deltaE2000;
	static deltaEJz: typeof deltaEJz;
	static deltaEITP: typeof deltaEITP;
	static deltaEOK: typeof deltaEOK;
	static deltaEMethods: typeof deltaEMethods;

	// interpolation
	// These signatures should always match those in interpolation.d.ts,
	// including the static versions
	/** Create color mixtures in any desired proportion between two colors */
	mix (color2: ColorTypes, options?: MixOptions): Color;
	mix (color2: ColorTypes, p: number, options?: MixOptions): Color;
	/**
	 * Creates a function that accepts a number and returns a color.
	 * For numbers in the range 0 to 1, the function interpolates;
	 * for numbers outside that range, the function extrapolates
	 * (and thus may not return the results you expect)
	 */
	range: ToColorPrototype<typeof range>;
	/** Get an array of discrete steps */
	steps (color2: ColorTypes, options?: StepsOptions): Color[];

	/** Create color mixtures in any desired proportion between two colors */
	static mix (
		color1: ColorTypes,
		color2: ColorTypes,
		options?: MixOptions
	): Color;
	static mix (
		color1: ColorTypes,
		color2: ColorTypes,
		p: number,
		options?: MixOptions
	): Color;
	/**
	 * Creates a function that accepts a number and returns a color.
	 * For numbers in the range 0 to 1, the function interpolates;
	 * for numbers outside that range, the function extrapolates
	 * (and thus may not return the results you expect)
	 */
	static range: typeof range;
	/** Get an array of discrete steps */
	static steps (
		color1: ColorTypes,
		color2: ColorTypes,
		options?: StepsOptions
	): Color[];
	static steps (range: Range, options?: StepsOptions): Color[];

	// luminance
	get luminance (): ReturnType<typeof getLuminance>;
	// the definition for this set in the orignial code like it doesn't actually use the parameter?
	set luminance (_: number);

	// variations
	lighten: ToColorPrototype<typeof lighten>;
	darken: ToColorPrototype<typeof darken>;
	static lighten: typeof lighten;
	static darken: typeof darken;
}

export default Color;
