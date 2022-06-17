import ColorSpace from "./space.js";
import {multiplyMatrices} from "./util.js";

export default class RGBColorSpace extends ColorSpace {
	constructor (options) {
		if (!options.coords) {
			options.coords = {
				r: {
					range: [0, 1],
					name: "Red"
				},
				g: {
					range: [0, 1],
					name: "Green"
				},
				b: {
					range: [0, 1],
					name: "Blue"
				}
			};
		}

		if (!options.base) {
			options.base = "xyz-d65";
		}

		if (options.toXYZ_M && options.fromXYZ_M) {
			options.toBase ??= rgb => multiplyMatrices(toXYZ_M, rgb);
			options.fromBase ??= xyz => multiplyMatrices(fromXYZ_M, xyz);
		}

		super(options);
	}
}