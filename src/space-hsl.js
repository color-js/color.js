import Color from "./space-srgb.js";

Color.defineSpace({
	id: "hsl",
	name: "HSL",
	coords: {
		hueHSL: [0, 360],
		saturationHSL: [0, 100],
		lightnessHSL: [0, 100]
	},
	inGamut(coords) {
		let rgb = this.toSRGB(coords);
		return Color.spaces.srgb.inGamut(rgb);
	},
	white: Color.whites.D65,

	// Adapted from https://en.wikipedia.org/wiki/HSL_and_HSV#From_RGB
	fromSRGB(rgb) {
		let max = Math.max.apply(Math, rgb);
		let min = Math.min.apply(Math, rgb);
		let [r, g, b] = rgb;
		let [h, s, l] = [0, 0, (min + max)/2];
		let d = max - min;

		if (d !== 0) {
			s = d * 100 / (100 - Math.abs(2 * l - 100));

			switch (max){
				case r: h = (g - b) / d + (g < b ? 6 : 0); break;
				case g: h = (b - r) / d + 2; break;
				case b: h = (r - g) / d + 4;
			}

			h = h * 60;
		}

		return [h, s, l * 100];
	},
	// Adapted from https://en.wikipedia.org/wiki/HSL_and_HSV#HSL_to_RGB
	toSRGB(hsl) {
		let [h, s, l] = hsl;
		s /= 100;
		l /= 100;
		let C = (1 - Math.abs(2 * l - 1)) * s;
		let X = C * (1 - Math.abs((h / 60) % 2 - 1));
		let i = Math.ceil(h / 60);
		let rgb = [0, 0, 0];
		if (i >= 1 && i <= 6) {
			rgb[(i === 1 || i === 6)? 0 : (i === 2 || i === 3)? 1 : 2] = C;
			rgb[(i === 2 || i === 5)? 0 : (i === 1 || i === 4)? 1 : 2] = X;
		}

		return rgb.map(c => c + l - C/2);
	},

	parse(str, parsed = Color.parseFunction(str)) {
		if (parsed && /^hsla?$/.test(parsed.name)) {
			let hsl = parsed.args;

			 // percentages are converted to [0, 1] by parseFunction
			hsl[1] *= 100;
			hsl[2] *= 100;

			return {
				spaceId: "hsl",
				coords: hsl.slice(0, 3),
				alpha: hsl[3]
			};
		}
	},

	instance: {
		toString ({precision, inGamut, commas, format} = {}) {
			if (!format) {
				format = (c, i) => i > 0? c + "%" : c;
			}

			return Color.prototype.toString.call(this, {
				precision, inGamut, commas, format,
				name: "hsl" + (commas && this.alpha < 1? "a" : "")
			});
		}
	}
});
