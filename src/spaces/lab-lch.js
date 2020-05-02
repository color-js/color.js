import Color from "./../color.js";

Color.defineSpace({
	id: "lab",
	name: "Lab",
	coords: {
		L: [0, 100],
		a: [-100, 100],
		b: [-100, 100]
	},
	inGamut: coords => true,
	// Assuming XYZ is relative to D50, convert to CIE Lab
	// from CIE standard, which now defines these as a rational fraction
	white: Color.whites.D50,
	ε: 216/24389,  // 6^3/29^3
	κ: 24389/27,   // 29^3/3^3
	fromXYZ(XYZ) {
		const κ = this.κ, ε = this.ε, white = this.white;

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
		// http://www.brucelindbloom.com/index.html?Eqn_RGB_XYZ_Matrix.html
		const κ = this.κ, ε = this.ε, white = this.white;

		// compute f, starting with the luminance-related term
		let f = [];
		f[1] = (Lab[0] + 16)/116;
		f[0] = Lab[1]/500 + f[1];
		f[2] = f[1] - Lab[2]/200;

		// compute xyz
		var xyz = [
			Math.pow(f[0], 3) > ε ?   Math.pow(f[0], 3)            : (116*f[0]-16)/κ,
			Lab[0] > κ * ε ?         Math.pow((Lab[0]+16)/116, 3) : Lab[0]/κ,
			Math.pow(f[2], 3)  > ε ?  Math.pow(f[2], 3)            : (116*f[2]-16)/κ
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
		toString ({precision, format} = {}) {
			if (!format) {
				format = (c, i) => i === 0? c + "%" : c;
			}

			return Color.prototype.toString.call(this, {name: "lab", precision, format});
		}
	}
});

Color.defineSpace({
	id: "lch",
	name: "LCH",
	coords: {
		lightness: [0, 100],
		chroma: [0, 150],
		hue: [0, 360],
	},
	inGamut: coords => true,
	white: Color.D50,
	fromLab (Lab) {
		// Convert to polar form
		let hue = Math.atan2(Lab[2], Lab[1]) * 180 / Math.PI;

		return [
			Lab[0], // L is still L
			Math.sqrt(Lab[1] ** 2 + Lab[2] ** 2), // Chroma
			(hue + 360) % 360 // Hue, in degrees [0 to 360)
		];
	},
	toLab (LCH) {
		// Convert from polar form
		return [
			LCH[0], // L is still L
			LCH[1] * Math.cos(LCH[2] * Math.PI / 180), // a
			LCH[1] * Math.sin(LCH[2] * Math.PI / 180)  // b
		];
	},
	parse (str, parsed = Color.parseFunction(str)) {
		if (parsed && parsed.name === "lch") {
			let L = parsed.args[0];

			// Percentages in lch() don't translate to a 0-1 range, but a 0-100 range
			if (L.percentage) {
				parsed.args[0] = L * 100;
			}

			return {
				spaceId: "lch",
				coords: parsed.args.slice(0, 3),
				alpha: parsed.args.slice(3)[0]
			};
		}
	},
	instance: {
		toString ({precision, format} = {}) {
			if (!format) {
				format = (c, i) => i === 0? c + "%" : c;
			}

			return Color.prototype.toString.call(this, {name: "lch", precision, format});
		}
	}
});
