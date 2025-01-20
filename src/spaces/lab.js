import ColorSpace from "../ColorSpace.js";
import { WHITES } from "../adapt.js";
import xyz_d50 from "./xyz-d50.js";

// κ * ε  = 2^3 = 8
const ε = 216 / 24389; // 6^3/29^3 == (24/116)^3
const ε3 = 24 / 116;
const κ = 24389 / 27; // 29^3/3^3

let white = WHITES.D50;

export default new ColorSpace({
	id: "lab",
	name: "Lab",
	coords: {
		l: {
			refRange: [0, 100],
			name: "Lightness",
		},
		a: {
			refRange: [-125, 125],
		},
		b: {
			refRange: [-125, 125],
		},
	},

	// Assuming XYZ is relative to D50, convert to CIE Lab
	// from CIE standard, which now defines these as a rational fraction
	white,

	base: xyz_d50,
	// Convert D50-adapted XYX to Lab
	// CIE 15.3:2004 section 8.2.1.1
	fromBase (XYZ) {
		// XYZ scaled relative to reference white
		let xyz = XYZ.map((value, i) => value / white[i]);
		let f = xyz.map(value => (value > ε ? Math.cbrt(value) : (κ * value + 16) / 116));

		let L = 116 * f[1] - 16;
		let a = 500 * (f[0] - f[1]);
		let b = 200 * (f[1] - f[2]);

		return [L, a, b];
	},
	// Convert Lab to D50-adapted XYZ
	// Same result as CIE 15.3:2004 Appendix D although the derivation is different
	// http://www.brucelindbloom.com/index.html?Eqn_RGB_XYZ_Matrix.html
	toBase (Lab) {
		// compute f, starting with the luminance-related term
		let [L, a, b] = Lab;
		let f = [];
		f[1] = (L + 16) / 116;
		f[0] = a / 500 + f[1];
		f[2] = f[1] - b / 200;

		// compute xyz
		// prettier-ignore
		let xyz = [
			f[0]   > ε3 ? Math.pow(f[0], 3)                : (116 * f[0] - 16) / κ,
			Lab[0] > 8  ? Math.pow((Lab[0] + 16) / 116, 3) : Lab[0] / κ,
			f[2]   > ε3 ? Math.pow(f[2], 3)                : (116 * f[2] - 16) / κ,
		];

		// Compute XYZ by scaling xyz by reference white
		return xyz.map((value, i) => value * white[i]);
	},

	formats: {
		lab: {
			coords: [
				"<percentage> | <number>",
				"<number> | <percentage>",
				"<number> | <percentage>",
			],
		},
	},
});
