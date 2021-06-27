import Color, {util} from "./srgb.js";
import * as angles from "../angles.js";

Color.defineSpace({
	id: "hsl",
	name: "HSL",
	coords: {
		hue: angles.range,
		saturation: [0, 100],
		lightness: [0, 100]
	},
	inGamut (coords, epsilon) {
		let rgb = this.to.srgb(coords);
		return Color.inGamut("srgb", rgb, {epsilon: epsilon});
	},
	white: Color.whites.D65,

	// Adapted from https://en.wikipedia.org/wiki/HSL_and_HSV#From_RGB
	from: {
		srgb (rgb) {
			let max = Math.max.apply(Math, rgb);
			let min = Math.min.apply(Math, rgb);
			let [r, g, b] = rgb;
			let [h, s, l] = [NaN, 0, (min + max)/2];
			let d = max - min;

			if (d !== 0) {
				s = (l === 0 || l === 1) ? 0 : (max - l) / Math.min(l, 1 - l);

				switch (max) {
					case r: h = (g - b) / d + (g < b ? 6 : 0); break;
					case g: h = (b - r) / d + 2; break;
					case b: h = (r - g) / d + 4;
				}

				h = h * 60;
			}

			return [h, s * 100, l * 100];
		}
	},
	// Adapted from https://en.wikipedia.org/wiki/HSL_and_HSV#HSL_to_RGB_alternative
	to: {
		srgb (hsl) {
			let [h, s, l] = hsl;
			h = h % 360;

			if (h < 0) {
				h += 360;
			}

			s /= 100;
			l /= 100;

			function f(n) {
				let k = (n + h/30) % 12;
				let a = s * Math.min(l, 1 - l);
				return l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
			}

			return [f(0), f(8), f(4)];
		}
	},

	parse (str, parsed = Color.parseFunction(str)) {
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
		// eslint-disable-next-line no-unused-vars
		toString ({precision, commas, format, inGamut, ...rest} = {}) {
			if (!format) {
				format = (c, i) => i > 0? c + "%" : c;
			}

			return Color.prototype.toString.call(this, {
				inGamut: true, // hsl() out of gamut makes no sense
				commas, format,
				name: "hsl" + (commas && this.alpha < 1? "a" : ""),
				...rest
			});
		}
	}
});

export default Color;
export {util, angles};
