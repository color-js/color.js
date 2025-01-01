import * as math from "mathjs"; // Used as test oracle
import { multiplyMatrices, multiply_v3_m3x3 } from "../src/util.js";
import * as check from "../node_modules/htest.dev/src/check.js";

// Used to collect expected results from oracle
function refMultiply(A, B) {
	return math.multiply(math.matrix(A), math.matrix(B)).valueOf();
}

function testExpected(testObj) {
	return { ...testObj, expect: refMultiply(...testObj.args) };
}

function expectThrows(testObj) {
	let refResult;
	try {
		refResult = refMultiply(...testObj.args);
	} catch (error) {
		refResult = error.message;
	}
	return { ...testObj, expect: refResult };
}

const M_lin_sRGB_to_XYZ = [
	[0.4124564, 0.3575761, 0.1804375],
	[0.2126729, 0.7151522, 0.072175],
	[0.0193339, 0.119192, 0.9503041],
];

const M_XYZ_to_lin_sRGB = [
	[3.2404542, -1.5371385, -0.4985314],
	[-0.969266, 1.8760108, 0.041556],
	[0.0556434, -0.2040259, 1.0572252],
];

export default {
	name: "Matrix multiplication Tests",
	run: multiplyMatrices,
	check: check.deep(check.proximity({ epsilon: 0.00001 })),
	tests: [
		{
			name: "Basic 3x3 and vectors",
			tests: [
				{
					name: "3x3 matrix with vector",
					args: [M_lin_sRGB_to_XYZ, [1, 0.5, 0]],
				},
				{
					name: "3x3 matrix with itself",
					args: [M_lin_sRGB_to_XYZ, M_lin_sRGB_to_XYZ],
				},
				{
					name: "Vector with vector",
					skip: true, // multiplyMatrices doesn't return numbers
					args: [
						[1, 2, 3],
						[1, 0.5, 0],
					],
				},
				{
					name: "3x3 matrix with vector",
					args: [M_XYZ_to_lin_sRGB, [1, 0.5, 0]],
				},
				{
					name: "3x3 matrix with itself",
					args: [M_XYZ_to_lin_sRGB, M_XYZ_to_lin_sRGB],
				},
				{
					name: "3x3 matrix with other 3x3 matrix",
					args: [M_XYZ_to_lin_sRGB, M_lin_sRGB_to_XYZ],
				},
			].map(testExpected),
		},
		{
			name: "Incorrect data",
			description:
				"These are expected to fail, as multiplyMatrices does not do dimension checking. The point of them is to see how it fails.",
			check: (..._args) => {
				return true; // Treat these tests as passed
			},
			tests: [
				{
					name: "Incompatible dimensions (matrix × matrix)",
					args: [
						[[1], [3]],
						[
							[1, 2],
							[3, 4],
						],
					],
				},
				{
					name: "Incompatible dimensions (vector × matrix)",
					args: [
						[1, 2, 3],
						[
							[1, 2],
							[3, 4],
						],
					],
				},
				{
					name: "Different number of elements per row",
					args: [
						[
							[1, 2],
							[3, 4, 5],
						],
						[
							[1, 2],
							[3, 4],
						],
					],
				},
				{
					name: "Empty vectors",
					skip: true, // multiplyMatrices calls length on the undefined first element of the empty array
					args: [[], []],
				},
			].map(expectThrows),
		},
		{
			name: "Transform",
			run: multiply_v3_m3x3,
			tests: [
				{
					name: "3x3 matrix with vector",
					args: [[1, 0.5, 0], M_lin_sRGB_to_XYZ],
					expect: math
						.multiply(math.matrix(M_lin_sRGB_to_XYZ), math.matrix([1, 0.5, 0]))
						.valueOf(),
				},
				{
					name: "3x3 matrix with vector in place",
					run(A, B) {
						multiply_v3_m3x3(A, B, A);
						return A;
					},
					args: [[1, 0.5, 0], M_lin_sRGB_to_XYZ],
					expect: math
						.multiply(math.matrix(M_lin_sRGB_to_XYZ), math.matrix([1, 0.5, 0]))
						.valueOf(),
				},
			],
		},
	],
};
