import ColorSpace from "../space.js";
import {multiplyMatrices} from "../util.js";
import XYZ_D65 from "./xyz-d65.js";

// Recalculated for consistent reference white
// see https://github.com/w3c/csswg-drafts/issues/6642#issuecomment-943521484
const XYZtoLMS_M = [
	[ 0.8190224432164319,    0.3619062562801221,   -0.12887378261216414 ],
	[ 0.0329836671980271,    0.9292868468965546,     0.03614466816999844 ],
	[ 0.048177199566046255,  0.26423952494422764,    0.6335478258136937  ]
];
// inverse of XYZtoLMS_M
const LMStoXYZ_M = [
	[  1.2268798733741557,  -0.5578149965554813,   0.28139105017721583],
	[ -0.04057576262431372,  1.1122868293970594,  -0.07171106666151701],
	[ -0.07637294974672142, -0.4214933239627914,   1.5869240244272418 ]
];
const LMStoLab_M = [
	[  0.2104542553,   0.7936177850,  -0.0040720468 ],
	[  1.9779984951,  -2.4285922050,   0.4505937099 ],
	[  0.0259040371,   0.7827717662,  -0.8086757660 ]
];
// LMStoIab_M inverted
const LabtoLMS_M = [
	[ 0.99999999845051981432,  0.39633779217376785678,   0.21580375806075880339  ],
	[ 1.0000000088817607767,  -0.1055613423236563494,   -0.063854174771705903402 ],
	[ 1.0000000546724109177,  -0.089484182094965759684, -1.2914855378640917399   ]
];

export default new ColorSpace({
	id: "oklab",
    name: "Oklab",
    coords: {
		l: {
			refRange: [0, 1],
			name: "L"
		},
		a: {
			refRange: [-0.4, 0.4]
		},
		b: {
			refRange: [-0.4, 0.4]
		}
    },

	// Note that XYZ is relative to D65
  white: "D65",
	base: XYZ_D65,
	fromBase (XYZ) {
		// move to LMS cone domain
		let LMS = multiplyMatrices(XYZtoLMS_M, XYZ);

		// non-linearity
		let LMSg = LMS.map(val => Math.cbrt(val));

		return multiplyMatrices(LMStoLab_M, LMSg);

	},
	toBase (OKLab) {
		// move to LMS cone domain
		let LMSg = multiplyMatrices(LabtoLMS_M, OKLab);

		// restore linearity
		let LMS = LMSg.map(val => val ** 3);

		return multiplyMatrices(LMStoXYZ_M, LMS);
	},

	formats: {
		"oklab": {
			coords: ["<percentage> | <number>", "<number> | <percentage>[-1,1]", "<number> | <percentage>[-1,1]"],
		}
	}
});
