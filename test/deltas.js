import "../src/spaces/index.js";
import deltas from "../src/deltas.js";
import * as check from "../node_modules/htest.dev/src/check.js";

export default {
	name: "deltas() tests",
	description: "These tests test the various Delta E algorithms.",
	run (c1, c2, o) {
		return deltas(c1, c2, o);
	},
	check: check.deep(check.shallowEquals({ epsilon: .0001, subset: true })),
	tests: [
		{
			name: "Same color space",
			tests: [
				{
					name: "Same color",
					args: ["red", "red"],
					expect: { spaceId: "srgb", coords: [0, 0, 0], alpha: 0 },
				},
				{
					args: ["white", "black"],
					expect: { spaceId: "srgb", coords: [1, 1, 1], alpha: 0 },
				},
				{
					name: "Hues should never have a difference > 180 by default",
					args: [
						{spaceId: "oklch", coords: [.5, .2, -180]},
						{spaceId: "oklch", coords: [.5, .2, 720]},
					],
					expect: { spaceId: "oklch", coords: [0, 0, 180], alpha: 0 },
				},
				{
					name: "If both coords are none, the delta should be none.",
					args: [
						{spaceId: "oklch", coords: [null, null, null], alpha: null},
						{spaceId: "oklch", coords: [null, null, null], alpha: null},
					],
					expect: { spaceId: "oklch", coords: [null, null, null], alpha: null },
				},
				{
					name: "If one coord is none, the delta should be 0.",
					args: [
						{spaceId: "oklch", coords: [.5, .2, -180], alpha: null},
						{spaceId: "oklch", coords: [null, null, null], alpha: .5},
					],
					expect: { spaceId: "oklch", coords: [0, 0, 0], alpha: 0 },
				},
			],
		},
		{
			name: "Different color space",
			tests: [
				{
					name: "Same color",
					args: ["red", "hsl(0 100% 50%)"],
					expect: { spaceId: "srgb", coords: [0, 0, 0], alpha: 0 },
				},
				{
					args: ["white", "hsl(0 100% 0%)"],
					expect: { spaceId: "srgb", coords: [1, 1, 1], alpha: 0 },
				},
			],
		},
		{
			name: "Forced color space",
			tests: [
				{
					name: "Same color",
					args: ["red", "hsl(0 100% 50%)", { space: "oklch" }],
					expect: { spaceId: "oklch", coords: [0, 0, 0], alpha: 0 },
				},
				{
					args: [{space: "srgb", coords: [1, 0, 0]}, {space: "srgb", coords: [.5, 0, 0]}, { space: "oklch" }],
					expect: { spaceId: "oklch", coords: [0.2523245655926571, 0.10354211689049864, 0], alpha: 0 },
				},
			],
		},
	],
};
