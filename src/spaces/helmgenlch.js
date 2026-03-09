/**
 * HelmGenLCh — cylindrical form of Helmlab GenSpace.
 *
 * Converts GenSpace's rectangular (L, a, b) coordinates to
 * cylindrical (L, C, h). Ideal for CSS interpolation contexts
 * like gradients and color-mix where hue angle matters.
 *
 * @see ./helmgen.js
 */
import ColorSpace from "../ColorSpace.js";
import HelmGen from "./helmgen.js";
import lch from "./lch.js";

export default new ColorSpace({
	id: "helmgenlch",
	name: "HelmGenLCh",
	cssId: "--helmgenlch",
	coords: {
		l: {
			refRange: [0, 1],
			name: "Lightness",
		},
		c: {
			refRange: [0, 0.4],
			name: "Chroma",
		},
		h: {
			refRange: [0, 360],
			type: "angle",
			name: "Hue",
		},
	},
	white: [0.95047, 1, 1.08883],

	base: HelmGen,
	fromBase: lch.fromBase,
	toBase: lch.toBase,
});
