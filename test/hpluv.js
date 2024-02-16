import Color from "../src/index.js";
import { check } from "./util.mjs";
import { readTestData, normalizeCoords } from "./hsluv/util.mjs";

let json = readTestData();
let srgbToHpluv = [];
let hpluvToSrgb = [];

Object.entries(json).forEach(([rgbHex, value]) => {
	let coords = normalizeCoords(value["hpluv"]);
	srgbToHpluv.push({ args: rgbHex, expect: coords });

	let color = `color(--hpluv ${coords[0]} ${coords[1]} ${coords[2]})`;
	hpluvToSrgb.push({ args: color, expect: value.rgb });
});

const tests = {
	name: "HPLuv Conversion Tests",
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
			name: "sRGB to HPLuv",
			data: {
				toSpace: "hpluv",
			},
			tests: srgbToHpluv,
		},
		{
			name: "HPLuv to sRGB",
			data: {
				toSpace: "srgb",
			},
			tests: hpluvToSrgb,
		},
	],
};

export default tests;
