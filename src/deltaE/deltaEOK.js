import Color from "../spaces/oklab.js";
// More accurate color-difference formulae
// than the simple 1976 Euclidean distance in Lab

// Based on calculations for deltaE CMS
// Has three meaningful components,
// ΔEOK = √(ΔL² + ΔC² + ΔH²)
// Uses OKLab rather than Lab,
// A nice increase in accuracy for modest increase in complexity

Color.prototype.deltaEOK = function (sample, deltas = {}) {
	let color = this;
	sample = Color.get(sample);

	// Given this color as the reference
	// and a sample,
	// calculate deltaEOK.

	let [L1, a1, b1] = color.oklab;
	let C1 = Math.sqrt(a1 ** 2 + b1 ** 2);
	let [L2, a2, b2] = sample.oklab;
	let C2 = Math.sqrt(a2 ** 2 + b2 ** 2);

	// Lightness and Chroma differences
	// These are (color - sample), unlike deltaE2000
	// This only matters is the three components are examined saparately,
	// rather than combined into one deltaE
	deltas.ΔL = L1 - L2;
	deltas.ΔC = C1 - C2;

	// Now calculate the length of the angular arc
	let Δa = a1 - a2;
	let Δb = b1 - b2;
	// H2 is the square of the angular arc
	let H2 = (Δa ** 2) + (Δb ** 2) - (deltas.ΔC ** 2);
	// due to roundoff error it is possible that, for near-zero a and b,
	// ΔC > Δa + Δb is 0, resulting in attempting
	// to take the square root of a negative number
	if (H2 < 0) {
		H2 = 0;
	}
	deltas.ΔH = Math.sqrt(H2);

	// Calculate the deltaE, term by term as root sume of squares
	let dE = deltas.ΔL ** 2 + deltas.ΔC ** 2 + H2;
	return Math.sqrt(dE);
};

Color.statify(["deltaEOK"]);
