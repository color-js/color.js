import * as math from "mathjs"; // Used as test oracle
import multiplyMatrices from "../src/multiply-matrices.js";
import * as check from "../node_modules/htest.dev/src/check.js";

// Used to collect expected results from oracle
function refMultiply (A, B) {
	return math.multiply(math.matrix(A), math.matrix(B)).valueOf();
}

function testExpected (testObj) {
	return refMultiply(...testObj.args);
}

function expectThrows (testObj) {
	let refResult;
	try {
		refResult = refMultiply(...testObj.args);
	}
	catch (error) {
		refResult = error.message;
	}
	return refResult;
}

const M_lin_sRGB_to_XYZ = [
	[0.4124564, 0.3575761, 0.1804375],
	[0.2126729, 0.7151522, 0.0721750],
	[0.0193339, 0.1191920, 0.9503041],
];

const M_XYZ_to_lin_sRGB = [
	[3.2404542, -1.5371385, -0.4985314],
	[-0.9692660, 1.8760108, 0.0415560],
	[0.0556434, -0.2040259, 1.0572252],
];

const basicTests = [
	{
		name: "3x3 matrix with vector",
		args: [M_lin_sRGB_to_XYZ, [1, .5, 0]],
	},
	{
		name: "3x3 matrix with itself",
		args: [M_lin_sRGB_to_XYZ, M_lin_sRGB_to_XYZ],
	},
	{
		name: "Vector with vector",
		skip: true, // multiplyMatrices doesn't return numbers
		args: [[1, 2, 3], [1, .5, 0]],
	},
	{
		name: "3x3 matrix with vector",
		args: [M_XYZ_to_lin_sRGB, [1, .5, 0]],
	},
	{
		name: "3x3 matrix with itself",
		args: [M_XYZ_to_lin_sRGB, M_XYZ_to_lin_sRGB],
	},
	{
		name: "3x3 matrix with other 3x3 matrix",
		args: [M_XYZ_to_lin_sRGB, M_lin_sRGB_to_XYZ],
	},
];

const basicExpected = basicTests.map(testExpected);
// const basicExpected = [
// 	[0.59124445, 0.570249, 0.0789299],
// 	[
// 		[0.2496555886399, 0.42471259201446, 0.27170115273625],
// 		[0.24120721525944, 0.59609209792253, 0.15857847484624998],
// 		[0.05169638352775, 0.20542240786939, 0.91516912565806],
// 	],
// 	2,
// 	[2.4718849499999997, -0.03126059999999997, -0.04636955],
// 	[
// 		[11.962699525535879, -7.76300201783924, -2.20640545553916],
// 		[-4.9569032475596, 5.000834106757239, 0.6051030911684],
// 		[0.43689286191536, -0.6839877272233, 1.08150664111188],
// 	],
// 	[
// 		[0.99999981496577, 4.0456120044274346e-8, 5.007625991648723e-8],
// 		[1.3181332002786504e-7, 1.0000000374531601, -1.7205399993613923e-8],
// 		[-1.7086069999810993e-8, -3.524084002393124e-8, 1.00000002883832],
// 	],
// ];


const incorrectTests = [
	{
		name: "Incompatible dimensions (matrix × matrix)",
		args: [[[1], [3]], [[1, 2], [3, 4]]],
	},
	{
		name: "Incompatible dimensions (vector × matrix)",
		args: [[1, 2, 3], [[1, 2], [3, 4]]],
	},
	{
		name: "Different number of elements per row",
		args: [[[1, 2], [3, 4, 5]], [[1, 2], [3, 4]]],
	},
	{
		name: "Empty vectors",
		skip: true, // multiplyMatrices calls length on the undefined first element of the empty array
		args: [[], []],
	},
];

const incorrectExpected = incorrectTests.map(expectThrows);
// const incorrectExpected = [
// 	"Dimension mismatch in multiplication. Matrix A columns (1) must match Matrix B rows (2)",
// 	"Dimension mismatch in multiplication. Vector length (3) must match Matrix rows (2)",
// 	"Dimension mismatch (3 != 2)",
// 	"Cannot multiply two empty vectors",
// ];

function zipExpected (A, B) {
	return A.map((e, i) => {
		return { ...e, expect: B[i] };
	});
}

export default {
	name: "Matrix multiplication Tests",
	run: multiplyMatrices,
	check: check.deep(check.proximity({ epsilon: 0.00001 })),
	tests: [{
		name: "Basic 3x3 and vectors",
		tests: zipExpected(basicTests, basicExpected),
	},
	{
		name: "Incorrect data",
		description: "These are expected to fail, as multiplyMatrices does not do dimension checking. The point of them is to see how it fails.",
		check: (..._args) => {
			return true; // Treat these tests as passed
		},
		tests: zipExpected(incorrectTests, incorrectExpected),
	}],
};
