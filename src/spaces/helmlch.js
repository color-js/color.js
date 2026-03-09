/**
 * HelmLCh — cylindrical form of Helmlab (MetricSpace).
 *
 * Converts Helmlab's rectangular (L, a, b) coordinates to
 * cylindrical (L, C, h) for intuitive hue and chroma manipulation.
 *
 * @see ./helmlab.js
 */
import ColorSpace from "../ColorSpace.js";
import Helmlab from "./helmlab.js";
import lch from "./lch.js";

export default new ColorSpace({
	id: "helmlch",
	name: "HelmLCh",
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
	white: "D65",

	base: Helmlab,
	fromBase: lch.fromBase,
	toBase: lch.toBase,
});
