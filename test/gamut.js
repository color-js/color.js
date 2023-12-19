import Color from "../src/index.js";
import { check } from "./util.mjs";

export default {
	name: "Gamut mapping tests",
	description: "These tests check how coords are shrunk to smaller gamuts.",
	run (colorStr, args) {
		let color = new Color(colorStr);
		let inGamut = this.data.method ? {method: this.data.method} : true;
		let color2 = color.to(this.data.toSpace, {inGamut});
		return color2;
	},
	map (c) {
		const color = new Color(c);
		return this.data.checkAlpha ? [
			...color.coords,
			color.alpha
		] : color.coords;
	},
	check: check.deep(check.proximity({ epsilon: 0.001 })),
	tests: [
		{
			name: "P3 primaries to sRGB, CSS algorithm",
			data: { toSpace: "srgb" },
			tests: [
				{
					args: ["color(display-p3 1 0 0)"],
					expect: "rgb(100% 4.457% 4.5932%)"
				},
				{
					args: ["color(display-p3 0 1 0)"],
					expect: "rgb(0% 98.576% 15.974%)"
				},
				{
					args: ["color(display-p3 0 0 1)"],
					expect: "rgb(0% 0% 100%)"
				},
				{
					args: ["color(display-p3 1 1 0)"],
					expect: "rgb(99.623% 99.901% 0%)"
				},

				{
					args: ["color(display-p3 0 1 1)"],
					expect: "rgb(0% 99.645% 98.471%)"
				},
				{
					args: ["color(display-p3 1 0 1)"],
					expect: "rgb(100% 16.736% 98.264%)"
				},
			]
		},
		{
			name: "P3 to sRGB whites/blacks CSS algorithm",
			data: { toSpace: "srgb" },
			tests: [
				{
					args: ["color(display-p3 1 1 1)"],
					expect: "rgb(100% 100% 100%)"
				},
				{
					args: ["color(display-p3 2 0 1)"],
					expect: "rgb(100% 100% 100%)"
				},
				{
					args: ["color(display-p3 0 0 0)"],
					expect: "rgb(0% 0% 0%)"
				},
				{
					args: ["color(display-p3 -1 0 0)"],
					expect: "rgb(0% 0% 0%)"
				}
			]
		},
		{
			name: "Maintains alpha",
			data: { toSpace: "srgb", checkAlpha: true },
			tests: [
				{
					args: ["color(display-p3 1 1 1 / 1)"],
					expect: "rgb(100% 100% 100%)"
				},
				{
					args: ["color(display-p3 1 1 1 / 0.5)"],
					expect: "rgb(100% 100% 100% / 0.5)"
				},
				{
					args: ["color(display-p3 1 1 1 / 0)"],
					expect: "rgb(100% 100% 100% / 0)"
				},
				{
					args: ["color(display-p3 1 0 0 / 1)"],
					expect: "rgb(100% 4.457% 4.5932%)"
				},
				{
					args: ["color(display-p3 1 0 0 / 0.5)"],
					expect: "rgb(100% 4.457% 4.5932% / 0.5)"
				},
				{
					args: ["color(display-p3 1 0 0 / 0)"],
					expect: "rgb(100% 4.457% 4.5932% / 0)"
				},
			]
		},
		{
			name: "P3 primaries to sRGB, LCH chroma Reduction",
			data: { toSpace: "srgb", method: "lch.c" },
			tests: [
				{
					args: ["color(display-p3 1 0 0)"],
					expect: "rgb(98.20411139286732% 21.834053137266363% 0%)"
				},
				{
					args: ["color(display-p3 0 1 0)"],
					expect: "rgb(0% 99.7921930734509% 0%)"
				},
				{
					args: ["color(display-p3 0 0 1)"],
					expect: "rgb(0% 0% 100%)"
				},
				{
					args: ["color(display-p3 1 1 0)"],
					expect: "rgb(100% 99.45446271521069% 0%)"
				},

				{
					args: ["color(display-p3 0 1 1)"],
					expect: "rgb(0% 100% 98.93709142382755%)"
				},
				{
					args: ["color(display-p3 1 0 1)"],
					expect: "rgb(100% 8.637212218104592% 98.22133121285436%)"
				}
			]
		},

		{
			name: "P3 primaries to sRGB, HSL saturation reduction",
			data: { method: "hsl.s", toSpace: "sRGB" },
			tests: [
				{
					args: ["color(display-p3 1 0 0)"],
					expect: "rgb(100% 0% 0%)"
				},
				{
					args: ["color(display-p3 0 1 0)"],
					expect: "rgb(0% 75.29% 0%)"
				},
				{
					args: ["color(display-p3 0 0 1)"],
					expect: "rgb(0% 0% 100%)"
				},
				{
					args: ["color(display-p3 1 1 0)"],
					expect: "rgb(84.872% 84.872% 0%)"
				},
				{
					args: ["color(display-p3 0 1 1)"],
					expect: "rgb(0% 76.098% 75.455%))"
				},
				{
					args: ["color(display-p3 1 0 1)"],
					expect: "rgb(100% 0% 100%)"
				}
			]
		},
		{
			name: "Using clipping",
			data: { method: "clip", toSpace: "sRGB" },
			tests: [
				{
					args: ["color(display-p3 1 0 0)"],
					expect: "rgb(100% 0% 0%)"
				},
				{
					args: ["color(display-p3 0 1 0)"],
					expect: "rgb(0% 100% 0%)"
				},
				{
					args: ["color(display-p3 0 0 1)"],
					expect: "rgb(0% 0% 100%)"
				},
			]
		},
	]
};
