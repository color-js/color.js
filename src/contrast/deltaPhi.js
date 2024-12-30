// Delta Phi Star perceptual lightness contrast
// See https://github.com/Myndex/deltaphistar
// The (difference between two Lstars each raised to phi) raised to (1/phi)
// Symmetric, does not matter which is foreground and which is background

import getColor from "../getColor.js";
import get from "../get.js";
import lab_d65 from "../spaces/lab-d65.js";

const phi = Math.pow(5, 0.5) * 0.5 + 0.5; // Math.phi can be used if Math.js

/**
 * @param {import("../types.js").ColorTypes} color1
 * @param {import("../types.js").ColorTypes} color2
 * @returns {number}
 */
export default function contrastDeltaPhi (color1, color2) {
	color1 = getColor(color1);
	color2 = getColor(color2);

	let Lstr1 = get(color1, [lab_d65, "l"]);
	let Lstr2 = get(color2, [lab_d65, "l"]);

	let deltaPhiStar = Math.abs(Math.pow(Lstr1, phi) - Math.pow(Lstr2, phi));

	let contrast = Math.pow(deltaPhiStar, 1 / phi) * Math.SQRT2 - 40;

	return contrast < 7.5 ? 0.0 : contrast;
}
