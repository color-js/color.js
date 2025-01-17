// APCA 0.0.98G
// https://github.com/Myndex/apca-w3
// see also https://github.com/w3c/silver/issues/643

import getColor from "../getColor.js";
import to from "../to.js";
import { isNone } from "../util.js";

// exponents
const normBG = 0.56;
const normTXT = 0.57;
const revTXT = 0.62;
const revBG = 0.65;

// clamps
const blkThrs = 0.022;
const blkClmp = 1.414;
const loClip = 0.1;
const deltaYmin = 0.0005;

// scalers
// see https://github.com/w3c/silver/issues/645
const scaleBoW = 1.14;
const loBoWoffset = 0.027;
const scaleWoB = 1.14;
const loWoBoffset = 0.027;

function fclamp (Y) {
	if (Y >= blkThrs) {
		return Y;
	}
	return Y + (blkThrs - Y) ** blkClmp;
}

function linearize (val) {
	let sign = val < 0 ? -1 : 1;
	let abs = Math.abs(val);
	return sign * Math.pow(abs, 2.4);
}

/**
 * Not symmetric, requires a foreground (text) color, and a background color
 * @param {import("../types.js").ColorTypes} background
 * @param {import("../types.js").ColorTypes} foreground
 * @returns {number}
 */
export default function contrastAPCA (background, foreground) {
	foreground = getColor(foreground);
	background = getColor(background);

	let S;
	let C;
	let Sapc;

	// Myndex as-published, assumes sRGB inputs
	let R, G, B;

	foreground = to(foreground, "srgb");
	// Should these be clamped to in-gamut values?

	// Calculates "screen luminance" with non-standard simple gamma EOTF
	// weights should be from CSS Color 4, not the ones here which are via Myndex and copied from Lindbloom
	[R, G, B] = foreground.coords.map(c => {
		return isNone(c) ? 0 : c;
	});
	let lumTxt = linearize(R) * 0.2126729 + linearize(G) * 0.7151522 + linearize(B) * 0.072175;

	background = to(background, "srgb");
	[R, G, B] = background.coords.map(c => {
		return isNone(c) ? 0 : c;
	});
	let lumBg = linearize(R) * 0.2126729 + linearize(G) * 0.7151522 + linearize(B) * 0.072175;

	// toe clamping of very dark values to account for flare
	let Ytxt = fclamp(lumTxt);
	let Ybg = fclamp(lumBg);

	// are we "Black on White" (dark on light), or light on dark?
	let BoW = Ybg > Ytxt;

	// why is this a delta, when Y is not perceptually uniform?
	// Answer: it is a noise gate, see
	// https://github.com/LeaVerou/color.js/issues/208
	if (Math.abs(Ybg - Ytxt) < deltaYmin) {
		C = 0;
	}
	else {
		if (BoW) {
			// dark text on light background
			S = Ybg ** normBG - Ytxt ** normTXT;
			C = S * scaleBoW;
		}
		else {
			// light text on dark background
			S = Ybg ** revBG - Ytxt ** revTXT;
			C = S * scaleWoB;
		}
	}
	if (Math.abs(C) < loClip) {
		Sapc = 0;
	}
	else if (C > 0) {
		// not clear whether Woffset is loBoWoffset or loWoBoffset
		// but they have the same value
		Sapc = C - loBoWoffset;
	}
	else {
		Sapc = C + loBoWoffset;
	}

	return Sapc * 100;
}
