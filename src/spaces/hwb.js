import Color from "./srgb.js";
// import * as hsl from "./hsl.js";

// The Hue, Whiteness Blackness (HWB) colorspace
// See https://drafts.csswg.org/css-color-4/#the-hwb-notation
// Note that, like HSL, calculations are done directly on
// gamma-corrected sRGB values rather than linearising them first.

Color.defineSpace({
	id: "hwb",
	name: "HWB",
	coords: {
		hue: [0, 360],
		whiteness: [0, 100],
		blackness: [0, 100]
	},
	inGamut (coords) {
		let rgb = this.toSRGB(coords);
		return Color.inGamut("srgb", rgb);
	},
    white: Color.whites.D65,

    fromSRGB (rgb) {
        let [r, g, b] = rgb;
        // TODO
    },

    toSRGB (hwb) {
        let [h, w, b] = hwb;
        // normalize so white plus black is no larger than 100
        let sum = w + b;
        if (sum > 100) {
            w /= sum;
            b /= sum;
        }
        // from https://drafts.csswg.org/css-color-4/#hwb-to-rgb
        let rgb = Color.spaces.hsl.toSRGB([h, 100, 50]);
        // now convert percentages to [0..1]
        w /=100;
        b /= 100;
        for(var i = 0; i < 3; i++) {
            rgb[i] *= (1 - w - b);
            rgb[i] += w;
          }
          return rgb;
    },

    parse (str, parsed = Color.parseFunction(str)) {
        if (parsed && /^hwba?$/.test(parsed.name)) {
			let hwb = parsed.args;

			 // white and black percentages are converted to [0, 1] by parseFunction
			hwb[1] *= 100;
			hwb[2] *= 100;

			return {
				spaceId: "hwb",
				coords: hwb.slice(0, 3),
				alpha: hwb[3]
			};
		}
    },

    instance: {
		toString ({precision, commas, format} = {}) {
            // TODO
        }
    }
});