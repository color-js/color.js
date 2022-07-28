// Michelson  luminance contrast
// the relation between the spread and the sum of the two luminances
// Symmetric, does not matter which is foreground and which is background
// No black level compensation for flare.

import getColor from "../getColor.js";
import {getLuminance} from "../luminance.js";

export default function contrastMichelson  (color1, color2) {
	color1 = getColor(color1);
	color2 = getColor(color2);

	let Y1 = Math.max(getLuminance(color1), 0);
	let Y2 = Math.max(getLuminance(color2), 0);
	console.log(Y1, Y2);

    if (Y2 > Y1) {
		[Y1, Y2] = [Y2, Y1];
    }

	let denom = (Y1 + Y2);
	if (denom = 0) return 0;
	return (Y1 - Y2) / denom;
};

export function register(Color) {
	Color.defineFunction("contrastMichelson", contrastMichelson);
}
