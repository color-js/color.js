import ColorSpace from "../src/spaces/index.js";
import serialize from "../src/serialize.js";

globalThis.ColorSpace = ColorSpace;

const tests = {
	name: "Color serialization Tests",
	description: "These tests parse different color formats and compare the result as JSON",
	run (spaceId, coords, alpha, options) {
		return serialize({spaceId, coords, alpha}, options);
	},
	tests: [
		{
			name: "Basic",
			tests: [
				{
					args: ["srgb", [1, 0.5, 0]],
					expect: "rgb(100% 50% 0%)",
				},
				{
					args: ["lch", [65, 20, 90]],
					expect: "lch(65% 20 90)",
				},
				{
					args: ["lab", [65, 20, 90]],
					expect: "lab(65% 20 90)",
				},
				{
					args: ["oklch", [.65, 0.2, 90]],
					expect: "oklch(65% 0.2 90)",
				},
				{
					args: ["oklab", [.65, 0.2, .1]],
					expect: "oklab(65% 0.2 0.1)",
				},
			],
		},
		{
			name: "With alpha",
			tests: [
				{
					args: ["srgb", [1, 0.5, 0], .5],
					expect: "rgb(100% 50% 0% / 0.5)",
				},
				{
					args: ["lch", [65, 20, 90], .5],
					expect: "lch(65% 20 90 / 0.5)",
				},
				{
					args: ["lab", [65, 20, 90], .5],
					expect: "lab(65% 20 90 / 0.5)",
				},
				{
					args: ["oklch", [.65, 0.2, 90], .5],
					expect: "oklch(65% 0.2 90 / 0.5)",
				},
				{
					args: ["oklab", [.65, 0.2, .1], .5],
					expect: "oklab(65% 0.2 0.1 / 0.5)",
				},
			],
		},
		{
			name: "Mandatory alpha",
			tests: [
				{
					args: ["srgb", [1, 0.5, 0], 1, {format: "rgba"}],
					expect: "rgba(100%, 50%, 0%, 1)",
				},
				{
					args: ["hsl", [180, 50, 50], 1, {format: "hsla"}],
					expect: "hsla(180, 50%, 50%, 1)",
				},
			],
		},
		{
			name: "Alternate formats",
			tests: [
				{
					name: "Hex",
					args: ["srgb", [1, 0.5, 0], 1, {format: "hex"}],
					expect: "#ff8000",
				},
			],
		},
		{
			name: "Custom coord format",
			tests: [
				{
					name: "rgb() with <number> coords",
					args: ["srgb", [1, 0.5, 0], 1, {coords: ["<number>[0,255]", "<number>[0,255]", "<number>[0,255]"]}],
					expect: "rgb(255 127.5 0)",
				},
				{
					name: "oklch(<percentage> <percentage> <angle>)",
					args: ["oklch", [0.5, 0.2, 180], 1, {coords: [, "<percentage>", "<angle>"]}],
					expect: "oklch(50% 50% 180deg)",
				},
			],
		},
		{
			name: "Custom alpha format",
			tests: [
				{
					name: "Force alpha",
					args: ["srgb", [1, 0.5, 0], 1, {alpha: true}],
					expect: "rgb(100% 50% 0% / 1)",
				},
				{
					name: "Force alpha in hex",
					args: ["srgb", [1, 0.5, 0], 1, {format: "hex", alpha: true}],
					expect: "#ff8000ff",
				},
				{
					name: "Force no alpha in hex",
					args: ["srgb", [1, 0.5, 0], 0.5, {format: "hex", alpha: false}],
					expect: "#ff8000",
				},
			],
		},
	],
};

export default tests;
