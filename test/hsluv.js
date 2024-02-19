import Color from "../src/index.js";
import { check } from "./util.mjs";
import { readTestData, normalizeCoords } from "./hsluv/util.mjs";

let json = readTestData();
let srgbToHsluv = [];
let hsluvToSrgb = [];

Object.entries(json).forEach(([rgbHex, value]) => {
	let coords = normalizeCoords(value["hsluv"]);
	srgbToHsluv.push({ args: rgbHex, expect: coords });

	let color = `color(--hsluv ${coords[0]} ${coords[1]} ${coords[2]})`;
	hsluvToSrgb.push({ args: color, expect: value.rgb });
});

const tests = {
	name: "HSLuv Conversion Tests",
	description: "These tests compare sRGB values against the HSLuv reference implementation snapshot data.",
	run (color, spaceId = this.data.toSpace) {
		color = new Color(color);
		return color.to(spaceId).coords;
	},
	check: check.deep(function (actual, expect) {
		if (expect === null || Number.isNaN(expect)) {
			// Treat NaN and null as equivalent for now
			return actual === null || Number.isNaN(actual);
		}

		let checkProximity = check.proximity({epsilon: this.data.epsilon});
		return checkProximity(actual, expect);
	}),
	data: {
		epsilon: .00000001,
	},
	tests: [
		{
			name: "sRGB to HSLuv",
			data: {
				toSpace: "hsluv",
			},
			tests: srgbToHsluv,
		},
		{
			name: "HSLuv to sRGB",
			data: {
				toSpace: "srgb",
			},
			tests: hsluvToSrgb,
		},
	],
};

export default tests;
