import RGBColorSpace from "../RGBColorSpace.js";
import XYZ_D50 from "./xyz-d50.js";

/** @import { Matrix3x3 } from "../types.js" */

/**
 * Matrices used by this color space, also available as `ProPhoto_Linear.M`.
 * Uses D50 (so no chromatic adaptation needed afterwards). The matrix cannot
 * be expressed in rational form, but is calculated to 64 bit accuracy.
 * see https://github.com/w3c/csswg-drafts/issues/7675
 * @type {Record<string, Matrix3x3>}
 */
// prettier-ignore
export const M = {
	toXYZ: [
		[ 0.79776664490064230,  0.13518129740053308,  0.03134773412839220 ],
		[ 0.28807482881940130,  0.71183523424187300,  0.00008993693872564 ],
		[ 0.00000000000000000,  0.00000000000000000,  0.82510460251046020 ],
	],
	fromXYZ: [
		[  1.34578688164715830, -0.25557208737979464, -0.05110186497554526 ],
		[ -0.54463070512490190,  1.50824774284514680,  0.02052744743642139 ],
		[  0.00000000000000000,  0.00000000000000000,  1.21196754563894520 ],
	],
};

export default new RGBColorSpace({
	id: "prophoto-linear",
	cssId: "--prophoto-rgb-linear",
	name: "Linear ProPhoto",
	white: "D50",
	base: XYZ_D50,
	M,
});
