import ColorSpace from "./space.js";
import {multiplyMatrices} from "./util.js";
import adapt from "./adapt.js";
import XYZ_D65 from "./spaces/xyz-d65.js";

/**
 * Convenience class for RGB color spaces
 * @extends {ColorSpace}
 */
export default class RGBColorSpace extends ColorSpace {
	/**
	 * Creates a new RGB ColorSpace.
	 * If coords are not specified, they will use the default RGB coords.
	 * Instead of `fromBase()` and `toBase()` functions,
	 * you can specify to/from XYZ matrices and have `toBase()` and `fromBase()` automatically generated.
	 * @param {*} options - Same options as {@link ColorSpace} plus:
	 * @param {number[][]} options.toXYZ_M - Matrix to convert to XYZ
	 * @param {number[][]} options.fromXYZ_M - Matrix to convert from XYZ
	 */
	constructor (options) {
		if (!options.coords) {
			options.coords = {
				r: {
					range: [0, 1],
					name: "Red",
				},
				g: {
					range: [0, 1],
					name: "Green",
				},
				b: {
					range: [0, 1],
					name: "Blue",
				},
			};
		}

		if (!options.base) {
			options.base = XYZ_D65;
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
