import Color, {angles} from "./hsl.js";

// The Hue, Whiteness Blackness (HWB) colorspace
// See https://drafts.csswg.org/css-color-4/#the-hwb-notation
// Note that, like HSL, calculations are done directly on
// gamma-corrected sRGB values rather than linearising them first.

Color.defineSpace({
	id: "hsv",
	name: "HSV",
	coords: {
		hue: angles.range,
		saturation: [0, 100],
		value: [0, 100]
	},
	inGamut (coords) {
		let hsl = this.to.hsl(coords);
		return Color.spaces.hsl.inGamut(hsl);
	},
	white: Color.whites.D65,

	from: {
		// https://en.wikipedia.org/wiki/HSL_and_HSV#Interconversion
		hsl (hsl) {
			let [h, s, l] = hsl;
			s /= 100;
			l /= 100;

			let v = l + s * Math.min(l, 1 - l);

			return [
				h, // h is the same
				v === 0? 0 : 200 * (1 - l / v), // s
				100 * v
			];
		},
	},

	to: {
		// https://en.wikipedia.org/wiki/HSL_and_HSV#Interconversion
		hsl (hsv) {
			let [h, s, v] = hsv;

			s /= 100;
			v /= 100;

			let l = v * (1 - s/2);

			return [
				h, // h is the same
				(l === 0 || l === 1)? 0 : ((v - l) / Math.min(l, 1 - l)) * 100,
				l * 100
			];
		}
	}
});
