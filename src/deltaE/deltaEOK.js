// More accurate color-difference formulae
// than the simple 1976 Euclidean distance in CIE Lab

import Color from "../color.js";
import "../spaces/oklab.js";

Color.prototype.deltaEOK = function (sample, deltas = {}) {
	let color = this;
	sample = Color.get(sample);

	// Given this color as the reference
	// and a sample,
	// calculate deltaEOK, term by term as root sum of squares
	let [L1, a1, b1] = color.oklab;
	let [L2, a2, b2] = sample.oklab;
	let ΔL = L1 - L2;
	let Δa = a1 - a2;
	let Δb = b1 - b2;
	return Math.sqrt(ΔL ** 2 + Δa ** 2 + Δb ** 2);
};

Color.statify(["deltaEOK"]);
