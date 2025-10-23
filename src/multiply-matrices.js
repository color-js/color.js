/** @import { Matrix3x3, Vector3 } from "./types.js" */

/**
 * A is m x n. B is n x p. product is m x p.
 *
 * Array arguments are treated like vectors:
 * - A becomes 1 x n
 * - B becomes n x 1
 *
 * Returns Matrix m x p or equivalent array or number
 *
 * @overload
 * @param {number[]} A Vector 1 x n
 * @param {number[]} B Vector n x 1
 * @returns {number} Scalar number
 *
 * @overload
 * @param {number[][]} A Matrix m x n
 * @param {number[]} B Vector n x 1
 * @returns {number[]} Array with length m
 *
 * @overload
 * @param {number[]} A Vector 1 x n
 * @param {number[][]} B Matrix n x p
 * @returns {number[]} Array with length p
 *
 * @overload
 * @param {number[][]} A Matrix m x n
 * @param {number[][]} B Matrix n x p
 * @returns {number[][]} Matrix m x p
 *
 * @param {number[] | number[][]} A Matrix m x n or a vector
 * @param {number[] | number[][]} B Matrix n x p or a vector
 * @returns {number | number[] | number[][]} Matrix m x p or equivalent array or number
 */
export default function multiplyMatrices (A, B) {
	let m = A.length;
	/** @type {number[][]} */
	let AM;
	/** @type {number[][]} */
	let BM;
	let aVec = false;
	let bVec = false;

	if (!Array.isArray(A[0])) {
		// A is vector, convert to [[a, b, c, ...]]
		AM = [/** @type {number[]} */ (A)];
		m = AM.length;
		aVec = true;
	}
	else {
		AM = /** @type {number[][]} */ (A);
	}

	if (!Array.isArray(B[0])) {
		// B is vector, convert to [[a], [b], [c], ...]]
		BM = B.length > 0 ? B.map(x => [x]) : [[]]; // Avoid mapping empty array
		bVec = true;
	}
	else {
		BM = /** @type {number[][]} */ (B);
	}

	let p = BM[0].length;
	let BM_cols = BM[0].map((_, i) => BM.map(x => x[i])); // transpose B
	/** @type {number[] | number[][]} */
	let product = AM.map(row =>
		BM_cols.map(col => {
			let ret = 0;

			if (!Array.isArray(row)) {
				for (let c of col) {
					ret += row * c;
				}

				return ret;
			}

			for (let i = 0; i < row.length; i++) {
				ret += row[i] * (col[i] || 0);
			}

			return ret;
		}));

	if (m === 1 && aVec) {
		product = product[0]; // Avoid [[a, b, c, ...]]
	}
	if (p === 1 && bVec) {
		if (m === 1 && aVec) {
			return product[0]; // Avoid [[a]], return a number
		}
		else {
			return product.map(x => x[0]); // Avoid [[a], [b], [c], ...]]
		}
	}

	return product;
}

// dot3 and transform functions adapted from https://github.com/texel-org/color/blob/9793c7d4d02b51f068e0f3fd37131129a4270396/src/core.js
//
// The MIT License (MIT)
// Copyright (c) 2024 Matt DesLauriers

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
// IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE
// OR OTHER DEALINGS IN THE SOFTWARE.

/**
 * Returns the dot product of two vectors each with a length of 3.
 *
 * @param {Vector3} a
 * @param {Vector3} b
 * @returns {number}
 */
function dot3 (a, b) {
	return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

/**
 * Transforms a vector of length 3 by a 3x3 matrix. Specify the same input and output
 * vector to transform in place.
 *
 * @param {Vector3} input
 * @param {Matrix3x3} matrix
 * @param {Vector3} [out]
 * @returns {Vector3}
 */
export function multiply_v3_m3x3 (input, matrix, out = [0, 0, 0]) {
	const x = dot3(input, matrix[0]);
	const y = dot3(input, matrix[1]);
	const z = dot3(input, matrix[2]);
	out[0] = x;
	out[1] = y;
	out[2] = z;
	return out;
}
