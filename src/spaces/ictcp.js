import ColorSpace from "../space.js";
import {multiplyMatrices} from "../util.js";
import XYZ_Abs_D65 from "./xyz-abs-d65.js";

const c1 = 3424 / 4096;
const c2 = 2413 / 128;
const c3 = 2392 / 128;
const m1 = 2610 / 16384;
const m2 = 2523 / 32;
const im1 = 16384 / 2610;
const im2 = 32 / 2523;

// The matrix below includes the 4% crosstalk components
// and is from the Dolby "What is ICtCp" paper"
const XYZtoLMS_M = [
	[  0.3592832590121217,  0.6976051147779502, -0.0358915932320290 ],
	[ -0.1920808463704993,  1.1004767970374321,  0.0753748658519118 ],
	[  0.0070797844607479,  0.0748396662186362,  0.8433265453898765 ],
];
// linear-light Rec.2020 to LMS, again with crosstalk
// rational terms from Jan Fröhlich,
// Encoding High Dynamic Range andWide Color Gamut Imagery, p.97
// and ITU-R BT.2124-0 p.2
/*
const Rec2020toLMS_M = [
	[ 1688 / 4096,  2146 / 4096,   262 / 4096 ],
	[  683 / 4096,  2951 / 4096,   462 / 4096 ],
	[   99 / 4096,   309 / 4096,  3688 / 4096 ]
];
*/
// this includes the Ebner LMS coefficients,
// the rotation, and the scaling to [-0.5,0.5] range
// rational terms from Fröhlich p.97
// and ITU-R BT.2124-0 pp.2-3
const LMStoIPT_M = [
	[  2048 / 4096,   2048 / 4096,       0      ],
	[  6610 / 4096, -13613 / 4096,  7003 / 4096 ],
	[ 17933 / 4096, -17390 / 4096,  -543 / 4096 ],
];

// inverted matrices, calculated from the above
const IPTtoLMS_M = [
	[ 0.9999999999999998,  0.0086090370379328,  0.1110296250030260 ],
	[ 0.9999999999999998, -0.0086090370379328, -0.1110296250030259 ],
	[ 0.9999999999999998,  0.5600313357106791, -0.3206271749873188 ],
];
/*
const LMStoRec2020_M = [
	[ 3.4375568932814012112,   -2.5072112125095058195,   0.069654319228104608382],
	[-0.79142868665644156125,   1.9838372198740089874,  -0.19240853321756742626 ],
	[-0.025646662911506476363, -0.099240248643945566751, 1.1248869115554520431  ]
];
*/
const LMStoXYZ_M = [
	[  2.0701522183894223, -1.3263473389671563,  0.2066510476294053 ],
	[  0.3647385209748072,  0.6805660249472273, -0.0453045459220347 ],
	[ -0.0497472075358123, -0.0492609666966131,  1.1880659249923042 ],
];

// Only the PQ form of ICtCp is implemented here. There is also an HLG form.
// from Dolby, "WHAT IS ICTCP?"
// https://professional.dolby.com/siteassets/pdfs/ictcp_dolbywhitepaper_v071.pdf
// and
// Dolby, "Perceptual Color Volume
// Measuring the Distinguishable Colors of HDR and WCG Displays"
// https://professional.dolby.com/siteassets/pdfs/dolby-vision-measuring-perceptual-color-volume-v7.1.pdf
export default new ColorSpace({
	id: "ictcp",
	name: "ICTCP",
	// From BT.2100-2 page 7:
	// During production, signal values are expected to exceed the
	// range E′ = [0.0 : 1.0]. This provides processing headroom and avoids
	// signal degradation during cascaded processing. Such values of E′,
	// below 0.0 or exceeding 1.0, should not be clipped during production
	// and exchange.
	// Values below 0.0 should not be clipped in reference displays (even
	// though they represent “negative” light) to allow the black level of
	// the signal (LB) to be properly set using test signals known as “PLUGE”
	coords: {
		i: {
			refRange: [0, 1],	// Constant luminance,
			name: "I",
		},
		ct: {
			refRange: [-0.5, 0.5],	// Full BT.2020 gamut in range [-0.5, 0.5]
			name: "CT",
		},
		cp: {
			refRange: [-0.5, 0.5],
			name: "CP",
		},
	},

	base: XYZ_Abs_D65,
	fromBase (XYZ) {
		// move to LMS cone domain
		let LMS = multiplyMatrices(XYZtoLMS_M, XYZ);

		return LMStoICtCp(LMS);
	},
	toBase (ICtCp) {
		let LMS = ICtCptoLMS(ICtCp);

		return multiplyMatrices(LMStoXYZ_M, LMS);
	},
});

function LMStoICtCp (LMS) {
	// apply the PQ EOTF
	// we can't ever be dividing by zero because of the "1 +" in the denominator
	let PQLMS = LMS.map (function (val) {
		let num = c1 + (c2 * ((val / 10000) ** m1));
		let denom = 1 + (c3 * ((val / 10000) ** m1));

		return (num / denom)  ** m2;
	});

	// LMS to IPT, with rotation for Y'C'bC'r compatibility
	return multiplyMatrices(LMStoIPT_M, PQLMS);
}

function ICtCptoLMS (ICtCp) {
	let PQLMS = multiplyMatrices(IPTtoLMS_M, ICtCp);

	// From BT.2124-0 Annex 2 Conversion 3
	let LMS = PQLMS.map (function (val) {
		let num  = Math.max((val ** im2) - c1, 0);
		let denom = (c2 - (c3 * (val ** im2)));
		return 10000 * ((num / denom) ** im1);
	});

	return LMS;
}
