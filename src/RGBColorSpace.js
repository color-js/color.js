import ColorSpace from "./ColorSpace.js";
import { multiply_v3_m3x3 } from "./util.js";
import adapt from "./adapt.js";
import XYZ_D65 from "./spaces/xyz-d65.js";

// Type re-exports
/** @typedef {import("./types.js").RGBOptions} RGBOptions */

/** Convenience class for RGB color spaces */
export default class RGBColorSpace extends ColorSpace {
	/**
	 * Creates a new RGB ColorSpace.
	 * If coords are not specified, they will use the default RGB coords.
	 * Instead of `fromBase()` and `toBase()` functions,
	 * you can specify to/from XYZ matrices and have the default `toBase()` and `fromBase()`
	 * methods use them via `this.M.toXYZ` and `this.M.fromXYZ`.
	 * @param {RGBOptions} options
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

		// Accept matrices either as dedicated options or via the generic `M` object
		let toXYZ = options.toXYZ_M ?? options.M?.toXYZ;
		let fromXYZ = options.fromXYZ_M ?? options.M?.fromXYZ;

		options.referred ??= "display";

		super(options);

		// Expose the matrices on the color space (via `this.M`) so consumers can reuse them.
		if (toXYZ && fromXYZ) {
			this.M.toXYZ = toXYZ;
			this.M.fromXYZ = fromXYZ;
		}
	}

	toBase (rgb) {
		let xyz = multiply_v3_m3x3(rgb, this.M.toXYZ);

		if (this.white !== this.base.white) {
			// Perform chromatic adaptation
			xyz = adapt(this.white, this.base.white, xyz);
		}

		return xyz;
	}

	fromBase (xyz) {
		xyz = adapt(this.base.white, this.white, xyz);
		return multiply_v3_m3x3(xyz, this.M.fromXYZ);
	}
}
