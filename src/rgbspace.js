import ColorSpace from "./space.js";
import {multiplyMatrices} from "./util.js";
import adapt from "./adapt.js";

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
			options.toBase ??= rgb => {
				let xyz = multiplyMatrices(options.toXYZ_M, rgb);

				if (this.white !== this.base.white) {
					// Perform chromatic adaptation
					xyz = adapt(this.white, this.base.white, xyz);
				}

				return xyz;
			};

			options.fromBase ??= xyz => {
				xyz = adapt(this.base.white, this.white, xyz);
				return multiplyMatrices(options.fromXYZ_M, xyz);
			};
		}

		options.referred ??= "display";

		super(options);
	}
}