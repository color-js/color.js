// Weber luminance contrast
// The difference between the two luminances divided by the lower luminance
// Symmetric, does not matter which is foreground and which is background
// No black level compensation for flare.

import getColor from "../getColor.js";
import {getLuminance} from "../luminance.js";

export default function contrastWeber (color1, color2) {
	color1 = getColor(color1);
	color2 = getColor(color2);

	let Y1 = Math.max(getLuminance(color1), 0);
	let Y2 = Math.max(getLuminance(color2), 0);

	if (Y2 > Y1) {
		[Y1, Y2] = [Y2, Y1];
	}

	return Y2 === 0 ? 0 : (Y1 - Y2) / Y2;
};