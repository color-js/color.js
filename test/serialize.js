import ColorSpace from "../src/spaces/index.js";
import serialize from "../src/serialize.js";

globalThis.ColorSpace = ColorSpace;

const tests = {
	name: "Color serialization Tests",
	description: "These tests parse different color formats and compare the result as JSON",
	run(spaceId, coords, alpha, options) {
		return serialize({ spaceId, coords, alpha }, options);
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
					args: ["oklch", [0.65, 0.2, 90]],
					expect: "oklch(65% 0.2 90)",
				},
				{
					args: ["oklab", [0.65, 0.2, 0.1]],
					expect: "oklab(65% 0.2 0.1)",
				},
			],
		},
		{
			name: "With alpha",
			tests: [
				{
					args: ["srgb", [1, 0.5, 0], 0.5],
					expect: "rgb(100% 50% 0% / 0.5)",
				},
				{
					args: ["lch", [65, 20, 90], 0.5],
					expect: "lch(65% 20 90 / 0.5)",
				},
				{
					args: ["lab", [65, 20, 90], 0.5],
					expect: "lab(65% 20 90 / 0.5)",
				},
				{
					args: ["oklch", [0.65, 0.2, 90], 0.5],
					expect: "oklch(65% 0.2 90 / 0.5)",
				},
				{
					args: ["oklab", [0.65, 0.2, 0.1], 0.5],
					expect: "oklab(65% 0.2 0.1 / 0.5)",
				},
			],
		},
		{
			name: "Mandatory alpha",
			tests: [
				{
					args: ["srgb", [1, 0.5, 0], 1, { format: "rgba" }],
					expect: "rgba(100%, 50%, 0%, 1)",
				},
				{
					args: ["hsl", [180, 50, 50], 1, { format: "hsla" }],
					expect: "hsla(180, 50%, 50%, 1)",
				},
			],
		},
		{
			name: "Alternate formats",
			tests: [
				{
					name: "Hex",
					args: ["srgb", [1, 0.5, 0], 1, { format: "hex" }],
					expect: "#ff8000",
				},
				{
					name: "Hex on non-sRGB color",
					args: ["hsl", [0, 100, 50], 1, { format: "hex" }],
					expect: "#f00",
				},
				{
					name: "Cannot serialize as keyword",
					args: ["srgb", [1, 0.5, 0], 1, { format: "keyword" }],
					throws: true,
				},
			],
		},
		{
			name: "Custom coord format",
			tests: [
				{
					name: "rgb() with <number> coords",
					args: [
						"srgb",
						[1, 0.5, 0],
						1,
						{ coords: ["<number>[0,255]", "<number>[0,255]", "<number>[0,255]"] },
					],
					expect: "rgb(255 127.5 0)",
				},
				{
					name: "oklch(<percentage> <percentage> <angle>)",
					args: ["oklch", [0.5, 0.2, 180], 1, { coords: [, "<percentage>", "<angle>"] }],
					expect: "oklch(50% 50% 180deg)",
				},
			],
		},
		{
			name: "Force commas",
			args: ["srgb", [1, 0.5, 0], 1, { commas: true }],
			expect: "rgb(100%, 50%, 0%)",
		},
		{
			name: "Custom alpha format",
			tests: [
				{
					name: "Force alpha",
					args: ["srgb", [1, 0.5, 0], 1, { alpha: true }],
					expect: "rgb(100% 50% 0% / 1)",
				},
				{
					name: "Percentage alpha",
					args: ["srgb", [1, 0.5, 0], 0.8, { alpha: "<percentage>" }],
					expect: "rgb(100% 50% 0% / 80%)",
				},
				{
					name: "Force alpha in hex",
					args: ["srgb", [1, 0.5, 0], 1, { format: "hex", alpha: true }],
					expect: "#ff8000ff",
				},
				{
					name: "Force no alpha in hex",
					args: ["srgb", [1, 0.5, 0], 0.5, { format: "hex", alpha: false }],
					expect: "#ff8000",
				},
			],
		},
		{
			name: "Values outside of range or refRange",
			tests: [
				{
					name: "sRGB negative %",
					args: ["srgb", [-0.5, 0, 0], 1, { inGamut: false }],
					expect: "rgb(-50% 0% 0%)",
				},
				{
					name: "sRGB %",
					args: ["srgb", [1.5, 0, 0], 1, { inGamut: false }],
					expect: "rgb(150% 0% 0%)",
				},
				{
					name: "sRGB %, inGamut: true",
					args: ["srgb", [-0.5, 0, 0], 1],
					expect: "rgb(0% 0% 0%)",
				},
				{
					name: "rgb()  with <number> coords",
					args: [
						"srgb",
						[2, 2, 2],
						1,
						{
							inGamut: false,
							coords: ["<number>[0,255]", "<number>[0,255]", "<number>[0,255]"],
						},
					],
					expect: "rgb(510 510 510)",
				},
				{
					name: "oklch negative values",
					args: ["oklch", [-0.1, -0.6, -50], 1],
					expect: "oklch(-10% -0.6 -50)",
				},
				{
					name: "hsl negative values",
					args: ["hsl", [-50, -10, -30], 1, { inGamut: false }],
					expect: "hsl(-50 -10% -30%)",
				},
				{
					name: "hsl positive values",
					args: ["hsl", [400, 123, 456], 1, { inGamut: false }],
					expect: "hsl(400 123% 456%)",
				},
			],
		},
	],
};

export default tests;
