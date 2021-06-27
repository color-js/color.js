import Color from "./../color.js";
import "./jzazbz.js";
import * as angles from "../angles.js";

Color.defineSpace({
	id: "jzczhz",
	name: "JzCzHz",
	coords: {
		Jz: [0, 1],
		chroma: [0, 1],
		hue: angles.range,
	},
	inGamut: _coords => true,
	white: Color.whites.D65,
	from: {
		jzazbz (jzazbz) {
			// Convert to polar form
			let [Jz, az, bz] = jzazbz;
			let hue;
			const ε = 0.0002; // chromatic components much smaller than a,b

			if (Math.abs(az) < ε && Math.abs(bz) < ε) {
				hue = NaN;
			}
			else {
				hue = Math.atan2(bz, az) * 180 / Math.PI;
			}

			return [
				Jz, // Jz is still Jz
				Math.sqrt(az ** 2 + bz ** 2), // Chroma
				angles.constrain(hue) // Hue, in degrees [0 to 360)
			];
		}
	},
	to: {
		jzazbz (jzczhz) {
			// Convert from polar form
			// debugger;
			return [
				jzczhz[0], // Jz is still Jz
				jzczhz[1] * Math.cos(jzczhz[2] * Math.PI / 180), // az
				jzczhz[1] * Math.sin(jzczhz[2] * Math.PI / 180)  // bz
			];
		}
	},
	parse (str, parsed = Color.parseFunction(str)) {
		if (parsed && parsed.name === "jzczhz") {
			return {
				spaceId: "jzczhz",
				coords: parsed.args.slice(0, 3),
				alpha: parsed.args.slice(3)[0]
			};
		}
	},

});

export default Color;
export {angles};
