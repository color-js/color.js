// Weber luminance contrast
// The difference between the two luminances divided by the lower luminance
// Symmetric, does not matter which is foreground and which is background
// No black level compensation for flare.

import getColor from "../getColor.js";
import {getLuminance} from "../luminance.js";

export default function contrastWeber (color1, color2) {
	color1 = getColor(color1);
	color2 = getColor(color2);

	let Y1 = getLuminance(color1);
	let Y2 = getLuminance(color2);

    if (Y2 > Y1) {
        [Y1, Y2] = [Y2, Y1];
    }

    return (Y1 - Y2) / Y2;
};

export function register(Color) {
	Color.defineFunction("contrastWeber", contrastWeber);
}
