import Color from "./../color.js";

Color.defineSpace({
	id: "lab",
	name: "Lab",
	coords: {
		L: [0, 100],
		a: [-100, 100],
		b: [-100, 100]
	},
	classification: ['labish'],
	inGamut: coords => true,
	// Assuming XYZ is relative to D50, convert to CIE Lab
	// from CIE standard, which now defines these as a rational fraction
	white: Color.whites.D50,
	ε: 216/24389,  // 6^3/29^3 == (24/116)^3
	ε3: 24/116,
	κ: 24389/27,   // 29^3/3^3
	// κ * ε  = 2^3 = 8
	fromXYZ(XYZ) {
		// Convert D50-adapted XYX to Lab
		//  CIE 15.3:2004 section 8.2.1.1
		const {κ, ε, white} = this;

		// compute xyz, which is XYZ scaled relative to reference white
		let xyz = XYZ.map((value, i) => value / white[i]);

		// now compute f
		let f = xyz.map(value => value > ε ? Math.cbrt(value) : (κ * value + 16)/116);

		return [
			(116 * f[1]) - 16, 	 // L
			500 * (f[0] - f[1]), // a
			200 * (f[1] - f[2])  // b
		];
	},
	toXYZ(Lab) {
		// Convert Lab to D50-adapted XYZ
		// Same result as CIE 15.3:2004 Appendix D although the derivation is different
		// http://www.brucelindbloom.com/index.html?Eqn_RGB_XYZ_Matrix.html
		const {κ, ε3, white} = this;

		// compute f, starting with the luminance-related term
		let f = [];
		f[1] = (Lab[0] + 16)/116;
		f[0] = Lab[1]/500 + f[1];
		f[2] = f[1] - Lab[2]/200;

		// compute xyz
		var xyz = [
			f[0]   > ε3  ?  Math.pow(f[0], 3)            : (116*f[0]-16)/κ,
			Lab[0] > 8   ?  Math.pow((Lab[0]+16)/116, 3) : Lab[0]/κ,
			f[2]   > ε3  ?  Math.pow(f[2], 3)            : (116*f[2]-16)/κ
		];

		// Compute XYZ by scaling xyz by reference white
		return xyz.map((value, i) => value * white[i]);
	},
	parse (str, parsed = Color.parseFunction(str)) {
		if (parsed && parsed.name === "lab") {
			let L = parsed.args[0];

			// Percentages in lab() don't translate to a 0-1 range, but a 0-100 range
			if (L.percentage) {
				parsed.args[0] = L * 100;
			}

			return {
				spaceId: "lab",
				coords: parsed.args.slice(0, 3),
				alpha: parsed.args.slice(3)[0]
			};
		}
	},
	instance: {
		toString ({format, ...rest} = {}) {
			if (!format) {
				format = (c, i) => i === 0? c + "%" : c;
			}

			return Color.prototype.toString.call(this, {name: "lab", format, ...rest});
		}
	}
});
