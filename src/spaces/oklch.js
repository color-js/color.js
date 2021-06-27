import Color from "./../color.js";
import "./oklab.js";
import * as angles from "../angles.js";

Color.defineSpace({
	id: "oklch",
	name: "OKLCh",
	coords: {
		lightness: [0, 1],
		chroma: [0, 1],
		hue: angles.range,
	},
	inGamut: _coords => true,
	white: Color.whites.D65,
	from: {
		oklab (oklab) {
			// Convert to polar form
			let [L, a, b] = oklab;
			let h;
			const ε = 0.0002; // chromatic components much smaller than a,b

			if (Math.abs(a) < ε && Math.abs(b) < ε) {
				h = NaN;
			}
			else {
				h = Math.atan2(b, a) * 180 / Math.PI;
			}

			return [
				L, // OKLab L is still L
				Math.sqrt(a ** 2 + b ** 2), // Chroma
				angles.constrain(h) // Hue, in degrees [0 to 360)
			];
		}
	},
	to: {
		// Convert from polar form
		oklab (oklch) {
			let [L, C, h] = oklch;
			let a, b;

			// check for NaN hue
			if (isNaN(h)) {
				a = 0;
				b = 0;
			}
			else {
				a = C * Math.cos(h * Math.PI / 180);
				b = C * Math.sin(h * Math.PI / 180);
			}

			return [ L, a, b ];
		}
	},
	parse (str, parsed = Color.parseFunction(str)) {
		if (parsed && parsed.name === "oklch") {
			return {
				spaceId: "oklch",
				coords: parsed.args.slice(0, 3),
				alpha: parsed.args.slice(3)[0]
			};
		}
	},

});

export default Color;
export {angles};
