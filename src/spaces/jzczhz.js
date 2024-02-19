import ColorSpace from "../space.js";
import Jzazbz from "./jzazbz.js";
import {constrain as constrainAngle} from "../angles.js";

export default new ColorSpace({
	id: "jzczhz",
	name: "JzCzHz",
	coords: {
		jz: {
			refRange: [0, 1],
			name: "Jz",
		},
		cz: {
			refRange: [0, 1],
			name: "Chroma",
		},
		hz: {
			refRange: [0, 360],
			type: "angle",
			name: "Hue",
		},
	},

	base: Jzazbz,
	fromBase (jzazbz) {
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
			constrainAngle(hue), // Hue, in degrees [0 to 360)
		];
	},
	toBase (jzczhz) {
		// Convert from polar form
		// debugger;
		return [
			jzczhz[0], // Jz is still Jz
			jzczhz[1] * Math.cos(jzczhz[2] * Math.PI / 180), // az
			jzczhz[1] * Math.sin(jzczhz[2] * Math.PI / 180),  // bz
		];
	},
});
