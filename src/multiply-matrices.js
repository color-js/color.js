/**
 * A is m x n. B is n x p. product is m x p.
 *
 * Array arguments are treated like vectors:
 * - A becomes 1 x n
 * - B becomes n x 1
 *
 * Returns Matrix m x p or equivalent array
 *
 * @overload
 * @param {number[]} A Vector 1 x n
 * @param {number[]} B Vector n x 1
 * @returns {number[]} Array with length 1
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
 * @returns {number[] | number[][]} Matrix m x p or equivalent array
 */
export default function multiplyMatrices (A, B) {
	let m = A.length;
	/** @type {number[][]} */
	let AM;
	/** @type {number[][]} */
	let BM;

	if (!Array.isArray(A[0])) {
		// A is vector, convert to [[a, b, c, ...]]
		AM = [/** @type {number[]} */ (A)];
	}
	else {
		AM = /** @type {number[][]} */ (A);
	}

	if (!Array.isArray(B[0])) {
		// B is vector, convert to [[a], [b], [c], ...]]
		BM = B.map(x => [x]);
	}
	else {
		BM = /** @type {number[][]} */ (B);
	}


	let p = BM[0].length;
	let BM_cols = BM[0].map((_, i) => BM.map(x => x[i])); // transpose B
	/** @type {number[] | number[][]} */
	let product = AM.map(row => BM_cols.map(col => {
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

	if (m === 1) {
		product = product[0]; // Avoid [[a, b, c, ...]]
	}
	if (p === 1) {
		return product.map(x => x[0]); // Avoid [[a], [b], [c], ...]]
	}

	return product;
}
