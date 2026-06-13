import ColorSpace from "../ColorSpace.js";
import P3 from "./p3.js";
import HSL from "./hsl.js";

export default new ColorSpace({
	id: "hsl-p3",
	cssId: "--hsl-p3",
	name: "HSL P3",
	coords: {
		h: {
			refRange: [0, 360],
			type: "angle",
			name: "Hue",
		},
		s: {
			range: [0, 100],
			name: "Saturation",
		},
		l: {
			range: [0, 100],
			name: "Lightness",
		},
	},

	base: P3,
	rgbGamut: P3,
	fromBase: HSL.fromBase,
	toBase: HSL.toBase,
});
