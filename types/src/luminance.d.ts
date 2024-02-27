import Color, { ColorTypes } from "./color.js";

export function getLuminance (color: ColorTypes): number;

export function setLuminance (
	color: ColorTypes,
	value: number | ((coord: number) => number),
): void;

export function register (color: typeof Color): void;
