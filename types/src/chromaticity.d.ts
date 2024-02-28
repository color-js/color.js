import Color, { ColorTypes } from "./color.js";

export function uv (color: ColorTypes): [number, number];

export function xy (color: ColorTypes): [number, number];

export function register (color: typeof Color): void;
