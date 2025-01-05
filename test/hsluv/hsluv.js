import { sRGB, HSLuv } from "../../src/index-fn.js";
import * as check from "../../node_modules/htest.dev/src/check.js";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export function readTestData () {
	try {
		const __dirname = path.dirname(fileURLToPath(import.meta.url));
		const filePath = path.resolve(__dirname, "snapshot-rev4.json");
		return JSON.parse(fs.readFileSync(filePath, "utf8"));
	}
	catch (err) {
		console.error(err);
	}
}

let json = readTestData();
let srgbToHsluv = [];
let hsluvToSrgb = [];

Object.entries(json).forEach(([rgbHex, value]) => {
	let coords = value.hsluv;
	let rgb = value.rgb;
	srgbToHsluv.push({ args: {space: sRGB, coords: rgb}, expect: coords });
	hsluvToSrgb.push({ args: {space: HSLuv, coords: coords}, expect: rgb });
});

const tests = {
	name: "HSLuv Conversion Tests",
	description: "These tests compare sRGB values against the HSLuv reference implementation snapshot data.",
	run (color, space = this.data.toSpace) {
		return space.from(color.space, color.coords);
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
