import { WHITES } from "./adapt";
import defaults from "./defaults";
import hooks from "./hooks";
import * as util from "./util";
import ColorSpace from "./space";

import {
	to,
	parse,
	serialize,
	inGamut,
	toGamut,
	distance,
	equals,
	get,
	getAll,
	set,
	setAll,
	display,
} from "./index-fn";

export type Coords = [number, number, number];

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
	: Array<T[number]>;

/** Convert a function to a prototype for Color */
export type ToColorPrototype<T extends (...args: any[]) => any> = T extends (
	color: Color,
	...args: infer A
) => infer R
	? T extends { returns: "color" }
		? (...args: A) => Color
		: (...args: A) => R
	: never;

/** Proxy used for space accessors */
export type SpaceAccessor = Record<string, number> & number[];

declare namespace Color {
	export {
		getAll,
		set,
		setAll,
		to,
		equals,
		inGamut,
		toGamut,
		distance,
		serialize as toString,
	};
	export { util, hooks, WHITES, ColorSpace as Space, parse, defaults };
	export const spaces: typeof ColorSpace["registry"];
}

declare class Color implements PlainColorObject {
	constructor(color: ColorTypes);
	constructor(space: string | ColorSpace, coords: Coords, alpha?: number);

	// These signatures should always be the same as the constructor
	static get(color: ColorTypes): Color;
	static get(
		space: string | ColorSpace,
		coords: Coords,
		alpha: number
	): Color;

	static defineFunction(name: string, code: DefineFunctionHybrid): void;
	static defineFunction(
		name: string,
		code: DefineFunctionCode,
		options: DefineFunctionOptions
	): void;

	static defineFunctions(objects: Record<string, DefineFunctionHybrid>): void;

	static extend(
		exports:
			| { register: (color: typeof Color) => void }
			| Record<string, DefineFunctionHybrid>
	): void;

	get space(): ColorSpace;
	get spaceId(): string;

	alpha: number;
	coords: Coords;

	clone(): this;

	// Copy parameter types from display function, except for the first one
	display(
		...args: RemoveFirstElement<Parameters<typeof display>>
	): string & { color: Color };

	toJSON(): ColorConstructor;

	// Functions defined using Color.defineFunctions
	get: ToColorPrototype<typeof get>;
	getAll: ToColorPrototype<typeof getAll>;
	set: ToColorPrototype<typeof set>;
	setAll: ToColorPrototype<typeof setAll>;
	to: ToColorPrototype<typeof to>;
	equals: ToColorPrototype<typeof equals>;
	inGamut: ToColorPrototype<typeof inGamut>;
	toGamut: ToColorPrototype<typeof toGamut>;
	distance: ToColorPrototype<typeof distance>;
	toString: ToColorPrototype<typeof serialize>;

	// Space accessors
	// A property should technically be added every time a new ColorSpace is initialized,
	// but I don't know that there's any good way to do that with TypeScript
	a98rgb: SpaceAccessor;
	a98rgb_linear: SpaceAccessor;
	acescc: SpaceAccessor;
	acescg: SpaceAccessor;
	hsl: SpaceAccessor;
	hsv: SpaceAccessor;
	hwb: SpaceAccessor;
	ictcp: SpaceAccessor;
	jzazbz: SpaceAccessor;
	jzczhz: SpaceAccessor;
	lab: SpaceAccessor;
	lab_d65: SpaceAccessor;
	lch: SpaceAccessor;
	oklab: SpaceAccessor;
	oklch: SpaceAccessor;
	p3: SpaceAccessor;
	p3_linear: SpaceAccessor;
	prophoto: SpaceAccessor;
	prophoto_linear: SpaceAccessor;
	rec2020: SpaceAccessor;
	rec2020_linear: SpaceAccessor;
	rec2100hlg: SpaceAccessor;
	rec2100pq: SpaceAccessor;
	srgb: SpaceAccessor;
	srgb_linear: SpaceAccessor;
	xyz: SpaceAccessor;
	xyz_abs_d65: SpaceAccessor;
	xyz_d50: SpaceAccessor;
	xyz_d65: SpaceAccessor;
}

export default Color;
