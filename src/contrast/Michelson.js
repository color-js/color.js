// Michelson  luminance contrast
// the relation between the spread and the sum of the two luminances
// Symmetric, does not matter which is foreground and which is background
// No black level compensation for flare.

import getColor from "../getColor.js";
import { getLuminance } from "../luminance.js";

/**
 * @param {import("../types.js").ColorTypes} color1
 * @param {import("../types.js").ColorTypes} color2
 * @returns {number}
 */
export default function contrastMichelson (color1, color2) {
	color1 = getColor(color1);
	color2 = getColor(color2);

	let Y1 = Math.max(getLuminance(color1), 0);
	let Y2 = Math.max(getLuminance(color2), 0);

	if (Y2 > Y1) {
		[Y1, Y2] = [Y2, Y1];
	}

	let denom = Y1 + Y2;
	return denom === 0 ? 0 : (Y1 - Y2) / denom;
}
