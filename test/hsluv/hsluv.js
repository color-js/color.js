import { to, sRGB, HSLuv } from "../../src/index-fn.js";
import { check } from "../util.mjs";
import { readTestData, normalizeCoords } from "./util.mjs";

let json = readTestData();
let srgbToHsluv = [];
let hsluvToSrgb = [];

Object.entries(json).forEach(([rgbHex, value]) => {
	let coords = normalizeCoords(value.hsluv);
	let rgb = value.rgb;
	srgbToHsluv.push({ args: {space: sRGB, coords: rgb, alpha: 1}, expect: coords });
	hsluvToSrgb.push({ args: {space: HSLuv, coords: coords, alpha: 1}, expect: rgb });
});

const tests = {
	name: "HSLuv Conversion Tests",
	description: "These tests compare sRGB values against the HSLuv reference implementation snapshot data.",
	run (color, space = this.data.toSpace) {
		return space.from(color);
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
				toSpace: HSLuv,
			},
			tests: srgbToHsluv,
		},
		{
			name: "HSLuv to sRGB",
			data: {
				toSpace: sRGB,
			},
			tests: hsluvToSrgb,
		},
	],
};

export default tests;
