import ColorSpace from "../ColorSpace.js";
import { multiply_v3_m3x3 } from "../util.js";
import XYZ_D65 from "./xyz-d65.js";

/** @import { Matrix3x3 } from "../types.js" */

// Recalculated for consistent reference white
// see https://github.com/w3c/csswg-drafts/issues/6642#issuecomment-943521484
/** @type {Matrix3x3} */
// prettier-ignore
const XYZtoLMS_M = [
	[ 0.8190224379967030, 0.3619062600528904, -0.1288737815209879 ],
	[ 0.0329836539323885, 0.9292868615863434,  0.0361446663506424 ],
	[ 0.0481771893596242, 0.2642395317527308,  0.6335478284694309 ],
];
// inverse of XYZtoLMS_M
/** @type {Matrix3x3} */
// prettier-ignore
const LMStoXYZ_M = [
	[  1.2268798758459243, -0.5578149944602171,  0.2813910456659647 ],
	[ -0.0405757452148008,  1.1122868032803170, -0.0717110580655164 ],
	[ -0.0763729366746601, -0.4214933324022432,  1.5869240198367816 ],
];
/** @type {Matrix3x3} */
// prettier-ignore
export const LMStoLab_M = [
	[ 0.2104542683093140,  0.7936177747023054, -0.0040720430116193 ],
	[ 1.9779985324311684, -2.4285922420485799,  0.4505937096174110 ],
	[ 0.0259040424655478,  0.7827717124575296, -0.8086757549230774 ],
];
// LMStoIab_M inverted
/** @type {Matrix3x3} */
// prettier-ignore
export const LabtoLMS_M = [
	[ 1.0000000000000000,  0.3963377773761749,  0.2158037573099136 ],
	[ 1.0000000000000000, -0.1055613458156586, -0.0638541728258133 ],
	[ 1.0000000000000000, -0.0894841775298119, -1.2914855480194092 ],
];

export default new ColorSpace({
	id: "oklab",
	name: "Oklab",
	coords: {
		l: {
			refRange: [0, 1],
			name: "Lightness",
		},
		a: {
			refRange: [-0.4, 0.4],
		},
		b: {
			refRange: [-0.4, 0.4],
		},
	},

	// Note that XYZ is relative to D65
	white: "D65",
	base: XYZ_D65,
	fromBase (XYZ) {
		// move to LMS cone domain
		let LMS = multiply_v3_m3x3(XYZ, XYZtoLMS_M);

		// non-linearity
		LMS[0] = Math.cbrt(LMS[0]);
		LMS[1] = Math.cbrt(LMS[1]);
		LMS[2] = Math.cbrt(LMS[2]);

		return multiply_v3_m3x3(LMS, LMStoLab_M, LMS);
	},
	toBase (OKLab) {
		// move to LMS cone domain
		let LMSg = multiply_v3_m3x3(OKLab, LabtoLMS_M);

		// restore linearity
		LMSg[0] = LMSg[0] ** 3;
		LMSg[1] = LMSg[1] ** 3;
		LMSg[2] = LMSg[2] ** 3;

		return multiply_v3_m3x3(LMSg, LMStoXYZ_M, LMSg);
	},

	formats: {
		oklab: {
			coords: [
				"<percentage> | <number>",
				"<number> | <percentage>",
				"<number> | <percentage>",
			],
		},
	},
});
