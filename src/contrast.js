import getColor from "./getColor.js";

// WCAG 2.0 contrast https://www.w3.org/TR/WCAG20-TECHS/G18.html
export default function contrast (color1, color2) {
	color1 = getColor(color1);
	color2 = getColor(color2);

	let L1 = color1.luminance;
	let L2 = color2.luminance;

	if (L2 > L1) {
		[L1, L2] = [L2, L1];
	}

	return (L1 + .05) / (L2 + .05);
}

export function register(Color) {
	Color.defineFunction("contrast", contrast);
}