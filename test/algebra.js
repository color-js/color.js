import * as math from "mathjs"; // Used as test oracle
import { solve, inv } from "../src/util.js";
import * as check from "../node_modules/htest.dev/src/check.js";

// Used to collect expected results from oracle
function refInv (A) {
	return math.inv(A).valueOf();
}

function refSolve (A, B) {
	return math.lusolve(A, B).valueOf();
}

function testInvExpected (testObj) {
	return { ...testObj, expect: refInv(...testObj.args) };
}

function testSolveExpected (testObj) {
	return { ...testObj, expect: refSolve(...testObj.args).map(x => x[0]) };
}

const M_lin_sRGB_to_XYZ = [
	[0.4123907992659593, 0.357584339383878, 0.1804807884018343],
	[0.21263900587151024, 0.715168678767756, 0.07219231536073371],
	[0.01933081871559182, 0.11919477979462598, 0.9505321522496607],
];

export default {
	name: "Linear Algebra Tests",
	check: check.deep(check.proximity({ epsilon: 1e-14 })),
	tests: [
		{
			name: "Invert matrices",
			tests: [
				{
					name: "Matrix inverse 3x3",
					run: inv,
					args: [M_lin_sRGB_to_XYZ],
				},
				{
					name: "Matrix inverse 2x2",
					run: inv,
					args: [
						[
							[1, 2],
							[0, 4],
						],
					],
				},
			].map(testInvExpected),
		},
		{
			name: "Solve system of linear equations",
			tests: [
				{
					name: "Matrix solve RGB value given an XYZ (white)",
					run: solve,
					args: [
						M_lin_sRGB_to_XYZ,
						[0.9504559270516715, 0.9999999999999999, 1.0890577507598784],
					],
				},
				{
					name: "Matrix solve RGB value given an XYZ (red)",
					run: solve,
					args: [
						M_lin_sRGB_to_XYZ,
						[0.4123907992659593, 0.21263900587151024, 0.01933081871559182],
					],
				},
				{
					name: "Solve 2D",
					run: solve,
					args: [
						[
							[1, 2],
							[0, 4],
						],
						[-2, 3],
					],
				},
			].map(testSolveExpected),
		},
	],
};
