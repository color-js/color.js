import {WHITES} from "../src/adapt.js";
import {adapt} from "../src/CATs.js";

import * as check from "../node_modules/htest.dev/src/check.js";

export default {
	name: "Chromatic adaptation tests",
	description: "These tests adapt from one whitepoint to another.",
	run: adapt,
	check: check.deep(check.proximity({epsilon: .00005})),
	tests: [
		{
			name: "Bradford D50 ⇔ D65",
			description: `These test the linear Bradford adaptations from CATs.js against the built-in
			conversion matrices to interconvert between D50 and D65.`,
			tests: [
				{
					name: "D50 to D65",
					args: [WHITES.D50, WHITES.D65, "Bradford"],
					expect: [
						[  0.955473421488075,    -0.02309845494876471,   0.06325924320057072  ],
						[ -0.0283697093338637,    1.0099953980813041,    0.021041441191917323 ],
						[  0.012314014864481998, -0.020507649298898964,  1.330365926242124    ],
					],
				},
				{
					name: "D65 to D50",
					args: [WHITES.D65, WHITES.D50, "Bradford"],
					expect: [
						[  1.0479297925449969,    0.022946870601609652,  -0.05019226628920524  ],
						[  0.02962780877005599,   0.9904344267538799,    -0.017073799063418826 ],
						[ -0.009243040646204504,  0.015055191490298152,   0.7518742814281371   ],
					],
				},
			],
		},
		// ,
		// {
		// 	name: "Bradford Other whitepoints",
		// 	description: `These test the linear Bradford adaptations from CATs.js against the matrices <a href="http://www.brucelindbloom.com/index.html?Eqn_ChromAdapt.html">published by Lindbloom</a>`,
		// 	tests: [
		// 		{
		// 			name: "C to D50",
		// 			args: [WHITES.C, WHITES.D50, "Bradford"],
		// 			expect: [
		// 				[ 1.0376976,  0.0153932, -0.0582624],
		// 				[ 0.0170675,  1.0056038, -0.0188973],
		// 				[-0.0120126,  0.0204361,  0.6906380]
		// 			],
		// 		},
		// 		{
		// 			name: "A to C",
		// 			args: [WHITES.A, WHITES.C, "Bradford"],
		// 			expect: [
		// 				[ 0.8530161, -0.1130268,  0.4404346],
		// 				[-0.1238786,  1.0853435,  0.1425803],
		// 				[ 0.0911907, -0.1553658,  3.4776250]
		// 			]
		// 		},
		// 		{
		// 			name: "F2 to D50",
		// 			args: [WHITES.F2, WHITES.D50, "Bradford"],
		// 			expect: [
		// 				[ 0.9628262, -0.0215790,  0.0457172],
		// 				[-0.0280310,  1.0172847,  0.0156071],
		// 				[ 0.0083415, -0.0135344,  1.2322804]
		// 			]
		// 		},
		// 	]
		// },
		// {
		// 	name: "von Kries Other whitepoints",
		// 	description: `These test the von Kries adaptations from CATs.js against the matrices <a href="http://www.brucelindbloom.com/index.html?Eqn_ChromAdapt.html">published by Lindbloom</a>.`,
		// 	tests: [
		// 		{
		// 			name: "C to D50",
		// 			args: [WHITES.C, WHITES.D50, "von Kries"],
		// 			expect: [
		// 				[ 1.0132609,  0.0457455, -0.0636638],
		// 				[ 0.0050248,  0.9962695, -0.0010128],
		// 				[ 0.0000000,  0.0000000,  0.6979583]
		// 			],
		// 		},
		// 		{
		// 			name: "A to C",
		// 			args: [WHITES.A, WHITES.C, "von Kries"],
		// 			expect: [
		// 				[ 0.9418277, -0.2249131,  0.4806950],
		// 				[-0.0247051,  1.0253682,  0.0049749],
		// 				[ 0.0000000,  0.0000000,  3.3225235]
		// 			]
		// 		},
		// 		{
		// 			name: "F2 to D50",
		// 			args: [WHITES.F2, WHITES.D50, "von Kries"],
		// 			expect: [
		// 				[ 0.9869554, -0.0470220,  0.0479582],
		// 				[-0.0051650,  1.0044210,  0.0010416],
		// 				[ 0.0000000,  0.0000000,  1.2244744]
		// 			]
		// 		},
		// 	]
		// },
		// {
		// 	name: "CAT02 and CAT16, D50 ⇔ D65",
		// 	description: "These test the fully adapted CAT02 and CAT16 adaptations from CATs.js, interconverting between D50 and D65.",
		// 	tests: [
		// 		{
		// 			name: "CAT02 D50 to D65",
		// 			args: [WHITES.D50, WHITES.D65, "CAT02"],
		// 			expect: [
		// 				[ 0.9599435, -0.0292880,  0.0656334],
		// 				[-0.0211745,  0.9988615,  0.0261212],
		// 				[ 0.0013700,  0.0044344,  1.3124836]
		// 			]
		// 		},
		// 		{
		// 			name: "CAT02 D65 to D50",
		// 			args: [WHITES.D65, WHITES.D50, "CAT02"],
		// 			expect: [
		// 				[ 1.0424827,  0.0308012, -0.0527444],
		// 				[ 0.0221295,  1.0018823, -0.0210462],
		// 				[-0.0011630, -0.0034170,  0.7620404]
		// 			]
		// 		},
		// 		{
		// 			name: "CAT16 D50 to D65",
		// 			args: [WHITES.D50, WHITES.D65, "CAT16"],
		// 			expect: [
		// 				[ 0.9894962, -0.0399233,  0.0439904],
		// 				[-0.0053910,  1.0066456, -0.0017541],
		// 				[-0.0004037,  0.0150564,  1.3016843]
		// 			]
		// 		},
		// 		{
		// 			name: "CAT16 D65 to D50",
		// 			args: [WHITES.D65, WHITES.D50, "CAT16"],
		// 			expect: [
		// 				[ 1.0108226,  0.0405991, -0.0341060],
		// 				[ 0.0054139,  0.99359563, 0.0011560],
		// 				[ 0.0002508, -0.01148016, 0.7682115]
		// 			]
		// 		},
		// 	]
		// },
		// {
		// 	name: "CAT16, C to D50",
		// 	description: "This tests the fully adapted CAT16 adaptation from CATs.js, Illuminant C to D50.",
		// 	tests: [
		// 		{
		// 			name: "CAT02 D50 to D65",
		// 			args: [WHITES.C, WHITES.D50, "CAT16"],
		// 			expect: [
		// 				[ 1.0059635,  0.0270676, -0.0418130],
		// 				[ 0.0037323,  0.9940963,  0.0018973],
		// 				[ 0.0004538, -0.0145289,  0.7098704]
		// 			]
		// 		}
		// 	]
		// }
	],
};
