// WCAG 2.0 contrast https://www.w3.org/TR/WCAG20-TECHS/G18.html
// Simple contrast, with fixed 5% viewing flare contribution
// Symmetric, does not matter which is foreground and which is background

import getColor from "../getColor.js";
import {getLuminance} from "../luminance.js";

export default function contrastWCAG21 (color1, color2) {
	color1 = getColor(color1);
	color2 = getColor(color2);

	let Y1 = getLuminance(color1);
	let Y2 = getLuminance(color2);

    if (Y2 > Y1) {
        [Y1, Y2] = [Y2, Y1];
    }

    return (Y1 + .05) / (Y2 + .05);
};

export function register(Color) {
	Color.defineFunction("contrastWCAG21", contrastWCAG21);
}
