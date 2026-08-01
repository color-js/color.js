import ColorSpace from "../ColorSpace.js";
import { isNone, skipNone } from "../util.js";
import XYZ_D65 from "./xyz-d65.js";

/**
 * CIE 1931 xyY separates chromaticity (x, y) from luminance (Y).
 */
export default new ColorSpace({
	id: "xyy",
	name: "xyY",
	coords: {
		x: {
			refRange: [0, 1],
			name: "x",
		},
		y: {
			refRange: [0, 1],
			name: "y",
		},
		Y: {
			refRange: [0, 1],
			name: "Y",
		},
	},

	base: XYZ_D65,

	// Convert D65-adapted XYZ to CIE 1931 xyY.
	fromBase (XYZ) {
		let [X, Y, Z] = XYZ.map(skipNone);
		let sum = X + Y + Z;

		// Chromaticity is undefined for black, so use the origin.
		if (sum === 0) {
			return [0, 0, Y];
		}

		return [X / sum, Y / sum, Y];
	},

	// Convert CIE 1931 xyY to D65-adapted XYZ.
	toBase (xyY) {
		let [x, y, Y] = xyY;

		// A zero or missing y cannot define a finite chromaticity ratio.
		if (y === 0 || isNone(y)) {
			return [0, 0, 0];
		}

		x = skipNone(x);
		Y = skipNone(Y);
		return [(x * Y) / y, Y, ((1 - x - y) * Y) / y];
	},

	formats: {
		color: {
			ids: ["xyy"],
			coords: [
				"<number> | <percentage>",
				"<number> | <percentage>",
				"<number> | <percentage>",
			],
		},
	},
});
