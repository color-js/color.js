import ColorSpace from "../src/spaces/index.js";
import parse from "../src/parse.js";
import serialize from "../src/serialize.js";
import Color from "../src/color.js";

globalThis.ColorSpace = ColorSpace;
globalThis.Color = Color;

const tests = {
	name: "Color reserialization tests",
	description:
		"These tests parse different color formats and reserialize the resulting color to check for roundtrip errors",
	tests: [
		{
			name: "OOP API",
			run(str) {
				return new Color(str).toString();
			},
			tests: [
				{
					name: "Different coord types",
					arg: "oklch(.5 20% 180deg)",
					expect: "oklch(0.5 20% 180deg)",
				},
				{
					name: "Percentage alpha",
					arg: "lab(0 0 0 / 80%)",
					expect: "lab(0 0 0 / 80%)",
				},
				{
					name: "Custom format (hex)",
					arg: "#ff8000",
					expect: "#ff8000",
				},
				{
					name: "rgb() with numbers",
					arg: "rgb(0 128 255)",
					expect: "rgb(0 128 255)",
				},
				{
					name: "Legacy rgb() format",
					arg: "rgb(0, 128, 255)",
					expect: "rgb(0, 128, 255)",
				},
				{
					name: "Legacy rgba() format",
					arg: "rgba(0, 128, 255, 1)",
					expect: "rgba(0, 128, 255, 1)",
				},
				{
					name: "Cannot serialize as keyword",
					arg: "red",
					expect: "rgb(100% 0% 0%)",
				},
			],
		},
		{
			name: "Functional API",
			run(str) {
				return serialize(parse(str));
			},
			tests: [
				{
					arg: "#ff0000",
					expect: "rgb(100% 0% 0%)",
				},
			],
		},
	],
};

export default tests;
