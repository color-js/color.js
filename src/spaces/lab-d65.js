import ColorSpace from "../ColorSpace.js";
import { WHITES } from "../adapt.js";
import xyz_d65 from "./xyz-d65.js";

// κ * ε  = 2^3 = 8
const ε = 216 / 24389; // 6^3/29^3 == (24/116)^3
const ε3 = 24 / 116;
const κ = 24389 / 27; // 29^3/3^3

let white = WHITES.D65;

export default new ColorSpace({
	id: "lab-d65",
	name: "Lab D65",
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

	// Assuming XYZ is relative to D65, convert to CIE Lab
	// from CIE standard, which now defines these as a rational fraction
	white,

	base: xyz_d65,
	// Convert D65-adapted XYZ to Lab
	//  CIE 15.3:2004 section 8.2.1.1
	fromBase (XYZ) {
		// compute xyz, which is XYZ scaled relative to reference white
		let xyz = XYZ.map((value, i) => value / white[i]);

		// now compute f
		let f = xyz.map(value => (value > ε ? Math.cbrt(value) : (κ * value + 16) / 116));

		return [
			116 * f[1] - 16, // L
			500 * (f[0] - f[1]), // a
			200 * (f[1] - f[2]), // b
		];
	},
	// Convert Lab to D65-adapted XYZ
	// Same result as CIE 15.3:2004 Appendix D although the derivation is different
	// http://www.brucelindbloom.com/index.html?Eqn_RGB_XYZ_Matrix.html
	toBase (Lab) {
		// compute f, starting with the luminance-related term
		let f = [];
		f[1] = (Lab[0] + 16) / 116;
		f[0] = Lab[1] / 500 + f[1];
		f[2] = f[1] - Lab[2] / 200;

		// compute xyz
		let xyz = [
			f[0] > ε3 ? Math.pow(f[0], 3) : (116 * f[0] - 16) / κ,
			Lab[0] > 8 ? Math.pow((Lab[0] + 16) / 116, 3) : Lab[0] / κ,
			f[2] > ε3 ? Math.pow(f[2], 3) : (116 * f[2] - 16) / κ,
		];

		// Compute XYZ by scaling xyz by reference white
		return xyz.map((value, i) => value * white[i]);
	},

	formats: {
		"lab-d65": {
			coords: [
				"<number> | <percentage>",
				"<number> | <percentage>",
				"<number> | <percentage>",
			],
		},
	},
});
