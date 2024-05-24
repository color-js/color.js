import "../src/spaces/index.js";
import serialize from "../src/serialize.js";

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
			]
		},
		{
			name: "Alternate formats",
			tests: [
				{
					name: "Hex",
					args: ["srgb", [1, 0.5, 0], 1, {format: "hex"}],
					expect: "#ff8000",
				},
			]
		}
	],
};

export default tests;
