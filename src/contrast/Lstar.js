// CIE Lightness difference, as used by Google Material Design
// Google HCT Tone is the same as CIE Lightness
// https://material.io/blog/science-of-color-design

import getColor from "../getColor.js";
import get from "../get.js";
import lab from "../spaces/lab.js";

export default function contrastLstar (color1, color2) {
	color1 = getColor(color1);
	color2 = getColor(color2);

	let L1 = get(color1, [lab, "l"]);
	let L2 = get(color2, [lab, "l"]);

	return Math.abs(L1 - L2);
}
