/**
 * Various utility functions
 */

export { default as multiplyMatrices, multiply_v3_m3x3 } from "./multiply-matrices.js";

/**
 * Check if a value is a string (including a String object)
 * @param {any} str - Value to check
 * @returns {str is string}
 */
export function isString (str) {
	return type(str) === "string";
}

/**
 * Determine the internal JavaScript [[Class]] of an object.
 * @param {any} o - Value to check
 * @returns {string}
 */
export function type (o) {
	let str = Object.prototype.toString.call(o);

	return (str.match(/^\[object\s+(.*?)\]$/)[1] || "").toLowerCase();
}

/**
 * @param {number} n
 * @param {{ precision?: number | undefined, unit?: string | undefined }} options
 * @returns {string}
 */
export function serializeNumber (n, { precision = 16, unit }) {
	if (isNone(n)) {
		return "none";
	}

	n = +toPrecision(n, precision);

	return n + (unit ?? "");
}

/**
 * Check if a value corresponds to a none argument
 * @param {any} n - Value to check
 * @returns {n is null}
 */
export function isNone (n) {
	return n === null;
}

/**
 * Replace none values with 0
 * @param {number | null} n
 * @returns {number}
 */
export function skipNone (n) {
	return isNone(n) ? 0 : n;
}

/**
 * Round a number to a certain number of significant digits
 * @param {number} n - The number to round
 * @param {number} precision - Number of significant digits
 */
export function toPrecision (n, precision) {
	if (n === 0) {
		return 0;
	}
	let integer = ~~n;
	let digits = 0;
	if (integer && precision) {
		digits = ~~Math.log10(Math.abs(integer)) + 1;
	}
	const multiplier = 10.0 ** (precision - digits);
	return Math.floor(n * multiplier + 0.5) / multiplier;
}

/**
 * @param {number} start
 * @param {number} end
 * @param {number} p
 */
export function interpolate (start, end, p) {
	if (isNaN(start)) {
		return end;
	}

	if (isNaN(end)) {
		return start;
	}

	return start + (end - start) * p;
}

/**
 * @param {number} start
 * @param {number} end
 * @param {number} value
 */
export function interpolateInv (start, end, value) {
	return (value - start) / (end - start);
}

/**
 * @param {[number, number]} from
 * @param {[number, number]} to
 * @param {number} value
 */
export function mapRange (from, to, value) {
	if (
		!from ||
		!to ||
		from === to ||
		(from[0] === to[0] && from[1] === to[1]) ||
		isNaN(value) ||
		value === null
	) {
		// Ranges missing or the same
		return value;
	}

	return interpolate(to[0], to[1], interpolateInv(from[0], from[1], value));
}

/**
 * Clamp value between the minimum and maximum
 * @param {number} min minimum value to return
 * @param {number} val the value to return if it is between min and max
 * @param {number} max maximum value to return
 */
export function clamp (min, val, max) {
	return Math.max(Math.min(max, val), min);
}

/**
 * Copy sign of one value to another.
 * @param {number} to - Number to copy sign to
 * @param {number} from - Number to copy sign from
 */
export function copySign (to, from) {
	return Math.sign(to) === Math.sign(from) ? to : -to;
}

/**
 * Perform pow on a signed number and copy sign to result
 * @param {number} base The base number
 * @param {number} exp The exponent
 */
export function spow (base, exp) {
	return copySign(Math.abs(base) ** exp, base);
}

/**
 * Perform a divide, but return zero if the denominator is zero
 * @param {number} n The numerator
 * @param {number} d The denominator
 */
export function zdiv (n, d) {
	return d === 0 ? 0 : n / d;
}

/**
 * Perform a bisect on a sorted list and locate the insertion point for
 * a value in arr to maintain sorted order.
 * @param {number[]} arr - array of sorted numbers
 * @param {number} value - value to find insertion point for
 * @param {number} lo - used to specify a the low end of a subset of the list
 * @param {number} hi - used to specify a the high end of a subset of the list
 */
export function bisectLeft (arr, value, lo = 0, hi = arr.length) {
	while (lo < hi) {
		const mid = (lo + hi) >> 1;
		if (arr[mid] < value) {
			lo = mid + 1;
		}
		else {
			hi = mid;
		}
	}
	return lo;
}

/**
 * Determines whether an argument is an instance of a constructor, including subclasses.
 * This is done by first just checking `instanceof`,
 * and then comparing the string names of the constructors if that fails.
 * @param {any} arg
 * @param {C} constructor
 * @template {new (...args: any) => any} C
 * @returns {arg is InstanceType<C>}
 */
export function isInstance (arg, constructor) {
	if (arg instanceof constructor) {
		return true;
	}

	const targetName = constructor.name;

	while (arg) {
		const proto = Object.getPrototypeOf(arg);
		const constructorName = proto?.constructor?.name;
		if (constructorName === targetName) {
			return true;
		}
		if (!constructorName || constructorName === "Object") {
			return false;
		}
		arg = proto;
	}

	return false;
}

/**
 * Generate a matrix of size NxN with the given diagonal values of length N.
 *
 * @param {number[]} values
 * @returns {number[][]}
 */
export function diag (values) {
	const n = values.length;
	const matrix = [];
	for (let i = 0; i < n; i++) {
		matrix[i] = [];
		for (let j = 0; j < n; j++) {
			matrix[i][j] = i === j ? values[i] : 0;
		}
	}
	return matrix;
}

/**
 * Calculate the LU decomposition of an NxN matrix.
 *
 * P is returned as PA = UL or A = P'UL which follows Matlab and Octave opposed to Scipy which returns P as
 * A = PUL or P'A = UL. For matrix inverse, we need P such that PA = UL and it is faster not having to invert
 * P, even if we can invert it fairly fast as it is just a shuffled identity matrix.
 *
 * P is returned as a permutation matrix unless pIndices is true, in which case P would be returned as
 * a vector containing the indexes such that A[P,:] = L*U.
 *
 * Reference:
 * - https://www.statlect.com/matrix-algebra/Gaussian-elimination
 * - https://www.sciencedirect.com/topics/mathematics/partial-pivoting
 *
 * @overload
 * @param {number[][]} matrix
 * @param {{ pIndices?: false | undefined }} [options]
 * @returns {[number[][], number[][], number[][]]}
 */
/**
 * @overload
 * @param {number[][]} matrix
 * @param {{ pIndices?: true }} [options]
 * @returns {[number[], number[][], number[][]]}
 */
/**
 * @param {number[][]} matrix
 * @param {{ pIndices?: boolean | undefined }} [options]
 * @returns {[number[] | number[][], number[][], number[][]]}
 */
export function lu (matrix, { pIndices = false } = {}) {
	let p1, p2, l, u;

	const n = matrix.length;

	// Initialize the triangle matrices along with the permutation matrix.
	if (pIndices) {
		p1 = Array.from({ length: n }, (_, index) => index);
		l = diag(new Array(n).fill(1));
	}
	else {
		p2 = diag(new Array(n).fill(1));
		l = structuredClone(p2);
	}
	u = structuredClone(matrix);

	// Create upper and lower triangle in 'u' and 'l'. 'p' tracks the permutation (relative position of rows)
	for (let i = 0; i < n - 1; i++) {
		// Partial pivoting: identify the row with the maximal value in the column
		let j = i;
		let maximum = Math.abs(u[i][i]);
		for (let k = i + 1; k < n; k++) {
			const a = Math.abs(u[k][i]);
			if (a > maximum) {
				j = k;
				maximum = a;
			}
		}

		// Partial pivoting: Swap rows
		if (j != i) {
			// Exchange current upper triangle row with row with maximal value at pivot
			// Update permutation matrix as well
			[u[i], u[j]] = [u[j], u[i]];
			if (pIndices) {
				[p1[i], p1[j]] = [p1[j], p1[i]];
			}
			else {
				[p2[i], p2[j]] = [p2[j], p2[i]];
			}

			// Only swap columns up to the pivot for the lower triangle,
			// if on first row, there is nothing to swap
			if (i) {
				for (let k = 0; k < i; k++) {
					[l[i][k], l[j][k]] = [l[j][k], l[i][k]];
				}
			}
		}

		// Zero at pivot point, nothing to do
		else if (!maximum) {
			continue;
		}

		// We have a pivot point, let's zero out everything above and below
		// the 'l' and 'u' diagonal respectively
		for (let j = i + 1; j < n; j++) {
			const scalar = u[j][i] / u[i][i];
			for (let k = i; k < n; k++) {
				u[j][k] += -u[i][k] * scalar;
				l[j][k] += l[i][k] * scalar;
			}
		}
	}

	if (pIndices) {
		return [p1, l, u];
	}
	return [p2, l, u];
}

/**
 * Forward substitution for solution of ax = b where a and b are matricies.
 *
 * @param {number[][]} a
 * @param {number[][]} b
 * @param {number} n
 * @returns {number[][]}
 */
function forwardSubMatrix (a, b, n) {
	for (let i = 0; i < n; i++) {
		const v = b[i];
		for (let j = 0; j < i; j++) {
			for (let k = 0; k < n; k++) {
				v[k] -= a[i][j] * b[j][k];
			}
		}
		for (let j = 0; j < n; j++) {
			v[j] /= a[i][i];
		}
	}
	return b;
}

/**
 * Back substitution for solution of ax = b where a and b are matricies.
 *
 * @param {number[][]} a
 * @param {number[][]} b
 * @param {number} n
 * @returns {number[][]}
 */
function backSubMatrix (a, b, n) {
	for (let i = n - 1; i > -1; i--) {
		const v = b[i];
		for (let j = i + 1; j < n; j++) {
			for (var k = 0; k < n; k++) {
				v[k] -= a[i][j] * b[j][k];
			}
		}
		for (let j = 0; j < n; j++) {
			b[i][j] /= a[i][i];
		}
	}
	return b;
}

/**
 * Forward substitution for solution of ax = b where a is a matrix and b is a vector.
 *
 * @param {number[][]} a
 * @param {number[]} b
 * @param {number} n
 * @returns {number[]}
 */
function forwardSubVector (a, b, n) {
	for (let i = 0; i < n; i++) {
		let v = b[i];
		for (let j = 0; j < i; j++) {
			v -= a[i][j] * b[j];
		}
		b[i] = v / a[i][i];
	}
	return b;
}

/**
 * Back substitution for solution of ax = b where a is a matrix and b is a vector.
 *
 * @param {number[][]} a
 * @param {number[]} b
 * @param {number} n
 * @returns {number[]}
 */
function backSubVector (a, b, n) {
	for (let i = n - 1; i > -1; i--) {
		let v = b[i];
		for (let j = i + 1; j < n; j++) {
			v -= a[i][j] * b[j];
		}
		b[i] = v / a[i][i];
	}
	return b;
}

/**
 * Invert a NxN matrix.
 *
 * @param {number[][]} matrix
 * @returns {number[][]}
 */
export function inv (matrix) {
	// Calculate the LU decomposition.
	const [p, l, u] = lu(matrix);
	const n = l.length;

	// Floating point math can produce very small, non-zero determinants for singular matrices.
	// This seems to happen in Numpy as well.
	// Don't bother calculating sign as we only care about how close to zero we are.
	if (l.map((row, i) => row[i] * u[i][i]).reduce((acc, val) => acc * val, 1) === 0.0) {
		throw new Error("Matrix is singular");
	}

	// Solve for the identity matrix (will give us inverse)
	// Permutation matrix is the identity matrix, even if shuffled.
	return backSubMatrix(u, forwardSubMatrix(l, p, n), n);
}

/**
 * Solve a NxN matrix representing a system of equations.
 *
 * @param {number[][]} matrix
 * @param {number[]} vector
 * @returns {number[]}
 */
export function solve (matrix, vector) {
	// Calculate the LU decomposition.
	const [p, l, u] = lu(matrix, { pIndices: true });
	const n = l.length;

	// If determinant is zero, we can't solve.
	if (l.map((row, i) => row[i] * u[i][i]).reduce((acc, val) => acc * val, 1) === 0.0) {
		throw new Error("Matrix is singular");
	}

	return backSubVector(
		u,
		forwardSubVector(
			l,
			p.map(i => vector[i]),
			n,
		),
		n,
	);
}
