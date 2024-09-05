import RGBColorSpace from "../RGBColorSpace.js";

// Type "imports"
/** @typedef {import("../types.js").Matrix3x3} Matrix3x3 */

/** @type {Matrix3x3} */
const toXYZ_M = [
	[0.4865709486482162, 0.26566769316909306, 0.1982172852343625],
	[0.2289745640697488, 0.6917385218365064,  0.079286914093745],
	[0.0000000000000000, 0.04511338185890264, 1.043944368900976],
];

/** @type {Matrix3x3} */
const fromXYZ_M = [
	[ 2.493496911941425,   -0.9313836179191239, -0.40271078445071684],
	[-0.8294889695615747,   1.7626640603183463,  0.023624685841943577],
	[ 0.03584583024378447, -0.07617238926804182, 0.9568845240076872],
];

export default new RGBColorSpace({
	id: "p3-linear",
	cssId: "--display-p3-linear",
	name: "Linear P3",
	white: "D65",
	toXYZ_M,
	fromXYZ_M,
});
