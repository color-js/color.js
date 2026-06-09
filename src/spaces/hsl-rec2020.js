import ColorSpace from "../ColorSpace.js";
import REC2020 from "./rec2020.js";
import HSL from "./hsl.js";

export default new ColorSpace({
	id: "hsl-rec2020",
	cssId: "--hsl-rec2020",
	name: "HSL Rec.2020",
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

	base: REC2020,
	rgbGamut: REC2020,
	fromBase: HSL.fromBase,
	toBase: HSL.toBase,
});
