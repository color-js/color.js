import getColor from "./getColor.js";
import {getLuminance} from "./luminance.js";

// WCAG 2.0 contrast https://www.w3.org/TR/WCAG20-TECHS/G18.html
export default function contrast (color1, color2) {
	color1 = getColor(color1);
	color2 = getColor(color2);

	let L1 = getLuminance(color1);
	let L2 = getLuminance(color2);

	if (L2 > L1) {
		[L1, L2] = [L2, L1];
	}

	return (L1 + .05) / (L2 + .05);
}

export function register(Color) {
	Color.defineFunction("contrast", contrast);
}