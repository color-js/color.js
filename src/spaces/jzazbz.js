import ColorSpace from "../ColorSpace.js";
import {multiply_v3_m3x3} from "../util.js";
import XYZ_Abs_D65 from "./xyz-abs-d65.js";

// Type "imports"
/** @typedef {import("../types.js").Matrix3x3} Matrix3x3 */
/** @typedef {import("../types.js").Vector3} Vector3 */


const b = 1.15;
const g = 0.66;
const n = 2610 / (2 ** 14);
const ninv = (2 ** 14) / 2610;
const c1 = 3424 / (2 ** 12);
const c2 = 2413 / (2 ** 7);
const c3 = 2392 / (2 ** 7);
const p = 1.7 * 2523 / (2 ** 5);
const pinv = (2 ** 5) / (1.7 * 2523);
const d = -0.56;
const d0 = 1.6295499532821566E-11;

/** @type {Matrix3x3} */
const XYZtoCone_M = [
	[  0.41478972, 0.579999,  0.0146480 ],
	[ -0.2015100,  1.120649,  0.0531008 ],
	[ -0.0166008,  0.264800,  0.6684799 ],
];
// XYZtoCone_M inverted
/** @type {Matrix3x3} */
const ConetoXYZ_M = [
	[  1.9242264357876067,  -1.0047923125953657,  0.037651404030618   ],
	[  0.35031676209499907,  0.7264811939316552, -0.06538442294808501 ],
	[ -0.09098281098284752, -0.3127282905230739,  1.5227665613052603  ],
];
/** @type {Matrix3x3} */
const ConetoIab_M = [
	[  0.5,       0.5,       0        ],
	[  3.524000, -4.066708,  0.542708 ],
	[  0.199076,  1.096799, -1.295875 ],
];
// ConetoIab_M inverted
/** @type {Matrix3x3} */
const IabtoCone_M = [
	[ 1,                   0.1386050432715393,   0.05804731615611886 ],
	[ 0.9999999999999999, -0.1386050432715393,  -0.05804731615611886 ],
	[ 0.9999999999999998, -0.09601924202631895, -0.8118918960560388  ],
];

export default new ColorSpace({
	id: "jzazbz",
	name: "Jzazbz",
	coords: {
		jz: {
			refRange: [0, 1],
			name: "Jz",
		},
		az: {
			refRange: [-0.5, 0.5],
		},
		bz: {
			refRange: [-0.5, 0.5],
		},
	},

	base: XYZ_Abs_D65,
	fromBase (XYZ) {
		// First make XYZ absolute, not relative to media white
		// Maximum luminance in PQ is 10,000 cd/m²
		// Relative XYZ has Y=1 for media white
		// BT.2048 says media white Y=203 at PQ 58

		let [ Xa, Ya, Za ] = XYZ;

		// modify X and Y
		let Xm = (b * Xa) - ((b - 1) * Za);
		let Ym = (g * Ya) - ((g - 1) * Xa);

		// move to LMS cone domain
		let LMS = multiply_v3_m3x3([ Xm, Ym, Za ], XYZtoCone_M);

		// PQ-encode LMS
		let PQLMS = /** @type {Vector3} } */ (LMS.map (function (val) {
			let num = c1 + (c2 * ((val / 10000) ** n));
			let denom = 1 + (c3 * ((val / 10000) ** n));

			return (num / denom)  ** p;
		}));

		// almost there, calculate Iz az bz
		let [ Iz, az, bz] = multiply_v3_m3x3(PQLMS, ConetoIab_M);
		// console.log({Iz, az, bz});

		let Jz = ((1 + d) * Iz) / (1 + (d * Iz)) - d0;
		return [Jz, az, bz];
	},
	toBase (Jzazbz) {
		let [Jz, az, bz] = Jzazbz;
		let Iz = (Jz + d0) / (1 + d - d * (Jz + d0));

		// bring into LMS cone domain
		let PQLMS = multiply_v3_m3x3([ Iz, az, bz ], IabtoCone_M);

		// convert from PQ-coded to linear-light
		let LMS = /** @type {Vector3} } */ (PQLMS.map(function (val) {
			let num = (c1 - (val ** pinv));
			let denom = (c3 * (val ** pinv)) - c2;
			let x = 10000 * ((num / denom) ** ninv);

			return (x); 	// luminance relative to diffuse white, [0, 70 or so].
		}));

		// modified abs XYZ
		let [ Xm, Ym, Za ] = multiply_v3_m3x3(LMS, ConetoXYZ_M);

		// restore standard D50 relative XYZ, relative to media white
		let Xa = (Xm + ((b - 1) * Za)) / b;
		let Ya = (Ym + ((g - 1) * Xa)) / g;
		return [ Xa, Ya, Za ];
	},

	formats: {
		// https://drafts.csswg.org/css-color-hdr/#Jzazbz
		"color": {
			coords: ["<number> | <percentage>", "<number> | <percentage>", "<number> | <percentage>"],
		},
	},
});
