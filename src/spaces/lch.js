import Color from "./../color.js";
import "./lab.js";
import * as angles from "../angles.js";

Color.defineSpace({
	id: "lch",
	name: "LCH",
	coords: {
		lightness: [0, 100],
		chroma: [0, 150],
		hue: angles.range,
	},
	inGamut: coords => true,
	white: Color.D50,
	from: {
		lab (Lab) {
			// Convert to polar form
			let [L, a, b] = Lab;
			let hue;
			const ε = 0.0005;

			if (Math.abs(a) < ε && Math.abs(b) < ε) {
				hue = NaN;
			}
			else {
				hue = Math.atan2(b, a) * 180 / Math.PI;
			}

			return [
				L, // L is still L
				Math.sqrt(a ** 2 + b ** 2), // Chroma
				angles.constrain(hue) // Hue, in degrees [0 to 360)
			];
		}
	},
	to: {
		lab (LCH) {
			// Convert from polar form
			return [
				LCH[0], // L is still L
				LCH[1] * Math.cos(LCH[2] * Math.PI / 180), // a
				LCH[1] * Math.sin(LCH[2] * Math.PI / 180)  // b
			];
		}
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
		toString ({format, ...rest} = {}) {
			if (!format) {
				format = (c, i) => i === 0? c + "%" : c;
			}

			return Color.prototype.toString.call(this, {name: "lch", format, ...rest});
		}
	}
});
