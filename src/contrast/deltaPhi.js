// Delta Phi Star perceptual lightness contrast
// The (difference between two Lstars each raised to phi) raised to (1/phi)
// Symmetric, does not matter which is foreground and which is background


import getColor from "../getColor.js";
import {getLuminance} from "../luminance.js";

// from CIE standard, which now defines these as rational fractions
const epsilon = 216/24389;  // 6^3/29^3
const kappa = 24389/27;    // 29^3/3^3

const phi = Math.pow(5, 0.5) * 0.5 + 0.5; // Math.phi can be used if Math.js

// CIE Y to Lstar
function YtoLstar(Y) {
	// Assuming Y is relative to D65 ref = 1, convert to CIE Lstar
	return Y > epsilon ? 116 * Math.cbrt(Y) - 16 : kappa * Y;
	// L* in range [0,100]
}

export default function contrastDeltaPhi (color1, color2) {
	color1 = getColor(color1);
	color2 = getColor(color2);

	let Lstr1 = YtoLstar(Math.max(getLuminance(color1), 0));
	let Lstr2 = YtoLstar(Math.max(getLuminance(color2), 0));

	let deltaPhiStar = Math.abs(Math.pow(Lstr1,phi) - Math.pow(Lstr2,phi));

	let contrast = Math.pow(deltaPhiStar, (1 / phi)) * Math.SQRT2 - 40;

	return (contrast < 7.5) ? 0.0 : contrast ;
};
