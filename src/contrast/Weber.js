// Weber luminance contrast
// The difference between the two luminances divided by the lower luminance
// Symmetric, does not matter which is foreground and which is background
// Optional offset for flare contribution

import getColor from "../getColor.js";
import {getLuminance} from "../luminance.js";

// the darkest sRGB color above black is #000001 and this produces
// a plain Weber contrast of ~45647.
// So, setting the divide-by-zero result at 50000 is a reasonable
// max clamp for the plain Weber
const max = 50000;

export default function contrastWeber (color1, color2, {offset = 0} = {}) {
	color1 = getColor(color1);
	color2 = getColor(color2);

	let Y1 = Math.max(getLuminance(color1), 0) + offset;
	let Y2 = Math.max(getLuminance(color2), 0) + offset;

	if (Y2 > Y1) {
		[Y1, Y2] = [Y2, Y1];
	}

	return Y2 === 0 ? max : (Y1 - Y2) / Y2;
};
