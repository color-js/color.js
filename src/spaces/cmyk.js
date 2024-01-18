import ColorSpace from "../space.js";
import sRGB from "./srgb.js";

let coordGrammar = Array(4).fill("<percentage> | <number>[0, 100]");
let coordGrammarNumber = Array(4).fill("<number>[0, 100]");

function fromCmyk (cmyk) {
	// Convert CMYK to sRGB
	let [c, m, y, k] = cmyk.map(el => el / 100);

	let r = 1 - Math.min(1, c * (1 - k) + k);
	let g = 1 - Math.min(1, m * (1 - k) + k);
	let b = 1 - Math.min(1, y * (1 - k) + k);

	r = Math.round(r * 255);
	g = Math.round(g * 255);
	b = Math.round(b * 255);

	return [r, g, b];
}

function toCmyk (rgb) {
	// Convert sRGB to CMYK
	let [r, g, b] = rgb;
	r /= 255;
	g /= 255;
	b /= 255;

	let k = Math.min(1 - r, 1 - g, 1 - b);
	let c = (1 - r - k) / (1 - k);
	let m = (1 - g - k) / (1 - k);
	let y = (1 - b - k) / (1 - k);
	let a = [c, m, y, k];
	let ans = a.map(el => el * 100);
	return ans; //[c, m, y, k].map(el => Math.round(el * 100));
}

export default new ColorSpace({
	id: "cmyk",
	name: "CMYK",
	base: sRGB,
	coords: {
		c: {
			refRange: [0, 100],
			name: "Cyan",
		},
		m: {
			refRange: [0, 100],
			name: "Magenta",
		},
		y: {
			refRange: [0, 100],
			name: "Yellow",
		},
		k: {
			refRange: [0, 100],
			name: "Key",
		}
	},



	fromBase: rgb => {
		return toCmyk(rgb);
	},
	toBase:  cmyk => {
		return fromCmyk(cmyk);
	},
	formats: {
		"cmyk": {
			coords: coordGrammar,
		},
		"cmyka": {
			coords: coordGrammar,
			commas: true,
			lastAlpha: true,
		},
	},
});
