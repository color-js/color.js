import ColorSpace from "../ColorSpace.js";
import OKLab from "./oklab.js";
import {toe, toeInv} from "./okhsl.js";

export default new ColorSpace({
	id: "oklrab",
	name: "Oklrab",
	coords: {
		l: {
			refRange: [0, 1],
			name: "Lightness",
		},
		a: {
			refRange: [-0.4, 0.4],
		},
		b: {
			refRange: [-0.4, 0.4],
		},
	},

	// Note that XYZ is relative to D65
	white: "D65",

	base: OKLab,
	fromBase (oklab) {
		return [toe(oklab[0]), oklab[1], oklab[2]];
	},
	toBase (oklrab) {
		return [toeInv(oklrab[0]), oklrab[1], oklrab[2]];
	},

	formats: {
		"color": {
			coords: ["<percentage> | <number>", "<number> | <percentage>[-1,1]", "<number> | <percentage>[-1,1]"],
		},
	},
});
