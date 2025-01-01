import Color from "../src/index.js";

export default {
	name: "In Gamut tests",
	description: "These tests check if a color is in a specific gamut",
	run(c1, ...args) {
		let color = new Color(c1);
		return color.inGamut(this.data.gamut);
	},
	check: (a, b) => a === b,
	tests: [
		{
			name: "HSLuv (gamutSpace of srgb)",
			data: {
				gamut: "hsluv",
			},
			tests: [
				{
					args: "red",
					expect: true,
				},
				{
					args: "color(--hsluv 150 100% 100%)",
					expect: true,
				},
				{
					args: "color(display-p3 1 0 0)",
					expect: false,
				},
				{
					args: "color(--hsluv 150 101% 50%)",
					expect: false,
				},
			],
		},
		{
			name: "HPLuv (gamutSpace of 'self')",
			data: {
				gamut: "hpluv",
			},
			tests: [
				{
					args: "#cc99aa",
					expect: true,
				},
				{
					args: "color(--hpluv 90 25% 75)",
					expect: true,
				},
				{
					args: "red",
					expect: false,
				},
				{
					args: "color(display-p3 1 0 0)",
					expect: false,
				},
			],
		},
		{
			name: "Lab (unbounded color space)",
			data: {
				gamut: "lab",
			},
			tests: [
				{
					args: "lab(1000 1000 1000)",
					expect: true,
				},
			],
		},
		{
			name: "HSL (polar space, defaults to the base space)",
			data: {
				gamut: "hsl",
			},
			tests: [
				{
					args: "hsl(0 100% 50%)",
					expect: true,
				},
				{
					args: "hsl(0 101% 50%)",
					expect: false,
				},
				{
					args: "color(display-p3 1 0 0)",
					expect: false,
				},
			],
		},
		{
			name: "Angle coordinates should not be gamut checked",
			data: {
				gamut: "hpluv",
			},
			tests: [
				{
					args: "color(--hpluv 720 50 25)",
					expect: true,
				},
			],
		},
	],
};
