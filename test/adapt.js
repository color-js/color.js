// The expected matrices here are computed at full double precision from the
// whitepoints and cone matrices in src/, rather than taken from Lindbloom's
// published tables. Lindbloom rounds to 7 decimals and uses slightly different
// D50/D65 definitions, which is why these tests were previously commented out:
// they cannot pass at a tolerance tight enough to catch a regression. See #397.
import { WHITES } from "../src/adapt.js";
import { adapt } from "../src/CATs.js";

import * as check from "../node_modules/htest.dev/src/check.js";

export default {
	name: "Chromatic adaptation tests",
	description: "These tests adapt from one whitepoint to another.",
	run: adapt,
	// The expected matrices below are exact to double precision, so the tolerance
	// only needs to absorb floating-point ordering differences.
	check: check.deep(check.proximity({ epsilon: 1e-13 })),
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
						[0.955473421488075, -0.02309845494876471, 0.06325924320057072],
						[-0.0283697093338637, 1.0099953980813041, 0.021041441191917323],
						[0.012314014864481998, -0.020507649298898964, 1.330365926242124],
					],
				},
				{
					name: "D65 to D50",
					args: [WHITES.D65, WHITES.D50, "Bradford"],
					expect: [
						[1.0479297925449969, 0.022946870601609652, -0.05019226628920524],
						[0.02962780877005599, 0.9904344267538799, -0.017073799063418826],
						[-0.009243040646204504, 0.015055191490298152, 0.7518742814281371],
					],
				},
			],
		},
		{
			name: "Bradford, other whitepoints",
			description: `These test the linear Bradford adaptations from CATs.js between whitepoints
			other than D50 and D65.`,
			tests: [
				{
					name: "C to D50",
					args: [WHITES.C, WHITES.D50, "Bradford"],
					expect: [
						[1.0377690616813835, 0.015432491863571384, -0.05829085610275015],
						[0.01712483023265995, 1.005561608870075, -0.018909106563750968],
						[-0.012014886977626546, 0.02043774049861692, 0.6905493794119026],
					],
				},
				{
					name: "A to C",
					args: [WHITES.A, WHITES.C, "Bradford"],
					expect: [
						[0.8530161029377393, -0.11302684514446544, 0.44043461027781017],
						[-0.1238786267164161, 1.085343482281527, 0.1425802702443609],
						[0.09119066102089231, -0.15536578576744575, 3.4776249673626407],
					],
				},
				{
					name: "F2 to D50",
					args: [WHITES.F2, WHITES.D50, "Bradford"],
					expect: [
						[0.9628901155936045, -0.021540547893197686, 0.04567838539624731],
						[-0.027976170151558757, 1.0172403858565684, 0.015592210273999952],
						[0.008336759449053958, -0.013528177762873878, 1.2321218554541207],
					],
				},
			],
		},
		{
			name: "von Kries, other whitepoints",
			description: `These test the von Kries adaptations from CATs.js between whitepoints other
			than D50 and D65. The third row is exactly zero outside the diagonal because the von Kries
			cone matrix has no cross-terms in its third row.`,
			tests: [
				{
					name: "C to D50",
					args: [WHITES.C, WHITES.D50, "von Kries"],
					expect: [
						[1.0132840543618833, 0.0458252820865854, -0.06368648854108123],
						[0.00503358221481348, 0.996262953823303, -0.0010146062357561762],
						[0, 0, 0.6978691069342143],
					],
				},
				{
					name: "A to C",
					args: [WHITES.A, WHITES.C, "von Kries"],
					expect: [
						[0.9418277287171762, -0.22491306586053403, 0.48069497222064267],
						[-0.02470510505654172, 1.0253682489745108, 0.004974874048335714],
						[0, 0, 3.3225235351974147],
					],
				},
				{
					name: "F2 to D50",
					args: [WHITES.F2, WHITES.D50, "von Kries"],
					expect: [
						[0.9869771433923064, -0.04694368550446698, 0.047922206295819544],
						[-0.005156430897830803, 1.0044136577843679, 0.0010398702624227812],
						[0, 0, 1.2243179595958933],
					],
				},
			],
		},
		{
			name: "CAT02 and CAT16, D50 ⇔ D65",
			description:
				"These test the fully adapted CAT02 and CAT16 adaptations from CATs.js, interconverting between D50 and D65.",
			tests: [
				{
					name: "CAT02 D50 to D65",
					args: [WHITES.D50, WHITES.D65, "CAT02"],
					expect: [
						[0.9598633148037599, -0.029371839290647215, 0.06573193477370372],
						[-0.021234333154949502, 0.9988908612350015, 0.026160700537248418],
						[0.0013724179601714644, 0.004440230349984853, 1.3129172960720608],
					],
				},
				{
					name: "CAT02 D65 to D50",
					args: [WHITES.D65, WHITES.D50, "CAT02"],
					expect: [
						[1.0425738924111991, 0.030891075263705114, -0.0528125659319374],
						[0.022193451065252008, 1.0018566328072378, -0.021073749209281616],
						[-0.0011648800532352013, -0.003420527482775093, 0.7617890755244796],
					],
				},
				{
					name: "CAT16 D50 to D65",
					args: [WHITES.D50, WHITES.D65, "CAT16"],
					expect: [
						[0.9894662537599116, -0.04003046264325008, 0.044053031713413716],
						[-0.005405187332525404, 1.006660686033583, -0.0017555195476181061],
						[-0.00040392099210183037, 0.015076802986294607, 1.302102113805948],
					],
				},
				{
					name: "CAT16 D65 to D50",
					args: [WHITES.D65, WHITES.D50, "CAT16"],
					expect: [
						[1.010854328937934, 0.04070861032350117, -0.03414458250068625],
						[0.005428142012307945, 0.9935819261930647, 0.0011559203885933907],
						[0.0002507224681170432, -0.011491875891322783, 0.7679649469115445],
					],
				},
			],
		},
		{
			name: "CAT16, C to D50",
			description:
				"This tests the fully adapted CAT16 adaptation from CATs.js, Illuminant C to D50.",
			tests: [
				{
					name: "CAT16 C to D50",
					args: [WHITES.C, WHITES.D50, "CAT16"],
					expect: [
						[1.0059848431095035, 0.027139669944084323, -0.04182756660272263],
						[0.0037416075974804224, 0.9940879775381585, 0.0018966762185267704],
						[0.0004535060219078323, -0.014532752280760022, 0.7097846465384112],
					],
				},
			],
		},
	],
};
