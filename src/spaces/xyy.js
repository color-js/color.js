import ColorSpace from "../ColorSpace.js";
import { getWhite } from "../adapt.js";
import { isNone, skipNone } from "../util.js";
import XYZ_D65 from "./xyz-d65.js";

const D65 = getWhite(XYZ_D65.white);
const D65_SUM = D65[0] + D65[1] + D65[2];
const D65_CHROMATICITY = [D65[0] / D65_SUM, D65[1] / D65_SUM];

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

		// Chromaticity is undefined for black, so use the reference white point.
		if (sum === 0) {
			return [...D65_CHROMATICITY, Y];
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
