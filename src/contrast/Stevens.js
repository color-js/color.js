// Stevens contrast
// Symmetric, does not matter which is foreground and which is background
// Viewing conditions can be modified by changing exponent and offset

import getColor from "../getColor.js";
import {getLuminance} from "../luminance.js";

export default function contrastStevens (color1, color2, {exponent = 1 / 3, offset = .0025} = {}) {
	color1 = getColor(color1);
	color2 = getColor(color2);

	let Y1 = Math.max(getLuminance(color1), 0) + offset;
	let Y2 = Math.max(getLuminance(color2), 0) + offset;

	let J1 = Math.pow(Y1, exponent);
	let J2 = Math.pow(Y2, exponent);

	return Math.abs(J1 - J2);
};
