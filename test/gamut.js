import Color from "../src/index.js";
import * as check from "../node_modules/htest.dev/src/check.js";

export default {
	name: "Gamut mapping tests",
	description: "These tests check how coords are shrunk to smaller gamuts.",
	run (colorStr, args) {
		let color = new Color(colorStr);
		let inGamut = this.data.method ? { method: this.data.method } : true;
		if (this.data.convertAfter) {
			return color
				.toGamut({ space: this.data.toSpace || color.space, method: this.data.method })
				.to(this.data.toSpace);
		}
		let color2 = color.to(this.data.toSpace || color.space, { inGamut });
		return color2;
	},
	map (c) {
		const color = new Color(c);
		return this.data.checkAlpha ? [...color.coords, color.alpha] : color.coords;
	},
	check: check.deep(check.proximity({ epsilon: 0.001 })),
	tests: [
		{
			name: "P3 primaries to sRGB, CSS algorithm",
			data: { toSpace: "srgb" },
			tests: [
				{
					args: ["color(display-p3 1 0 0)"],
					expect: "rgb(100% 4.457% 4.5932%)",
				},
				{
					args: ["color(display-p3 0 1 0)"],
					expect: "rgb(0% 98.576% 15.974%)",
				},
				{
					args: ["color(display-p3 0 0 1)"],
					expect: "rgb(0% 0% 100%)",
				},
				{
					args: ["color(display-p3 1 1 0)"],
					expect: "rgb(99.623% 99.901% 0%)",
				},

				{
					args: ["color(display-p3 0 1 1)"],
					expect: "rgb(0% 99.645% 98.471%)",
				},
				{
					args: ["color(display-p3 1 0 1)"],
					expect: "rgb(100% 16.736% 98.264%)",
				},
			],
		},
		{
			name: "P3 to sRGB whites/blacks CSS algorithm",
			data: { toSpace: "srgb" },
			tests: [
				{
					args: ["color(display-p3 1 1 1)"],
					expect: "rgb(100% 100% 100%)",
				},
				{
					args: ["color(display-p3 2 0 1)"],
					expect: "rgb(100% 100% 100%)",
				},
				{
					args: ["color(display-p3 0 0 0)"],
					expect: "rgb(0% 0% 0%)",
				},
				{
					args: ["color(display-p3 -1 0 0)"],
					expect: "rgb(0% 0% 0%)",
				},
			],
		},
		{
			name: "Maintains alpha",
			data: { toSpace: "srgb", checkAlpha: true },
			tests: [
				{
					args: ["color(display-p3 1 1 1 / 1)"],
					expect: "rgb(100% 100% 100%)",
				},
				{
					args: ["color(display-p3 1 1 1 / 0.5)"],
					expect: "rgb(100% 100% 100% / 0.5)",
				},
				{
					args: ["color(display-p3 1 1 1 / 0)"],
					expect: "rgb(100% 100% 100% / 0)",
				},
				{
					args: ["color(display-p3 1 0 0 / 1)"],
					expect: "rgb(100% 4.457% 4.5932%)",
				},
				{
					args: ["color(display-p3 1 0 0 / 0.5)"],
					expect: "rgb(100% 4.457% 4.5932% / 0.5)",
				},
				{
					args: ["color(display-p3 1 0 0 / 0)"],
					expect: "rgb(100% 4.457% 4.5932% / 0)",
				},
			],
		},
		{
			name: "Does not alter in-gamut colors",
			data: { toSpace: "hsl" },
			tests: [
				{
					args: ["hsl(0 50% 50%)"],
					expect: "hsl(0 50% 50%)",
				},
				{
					args: ["hsl(360 50% 50%)"],
					expect: "hsl(360 50% 50%)",
				},
			],
		},
		{
			name: "P3 primaries to sRGB, Ray Trace algorithm",
			data: { toSpace: "srgb-linear", method: "raytrace" },
			tests: [
				{
					args: ["color(display-p3 1 0 0)"],
					expect: "color(srgb-linear 1 0.0342 0.02168)",
				},
				{
					args: ["color(display-p3 0 1 0)"],
					expect: "color(srgb-linear 0 0.92946 0.07742)",
				},
				{
					args: ["color(display-p3 0 0 1)"],
					expect: "color(srgb-linear 0 0.01714 0.97711)",
				},
				{
					args: ["color(display-p3 1 1 0)"],
					expect: "color(srgb-linear 0.98002 0.99395 0)",
				},

				{
					args: ["color(display-p3 0 1 1)"],
					expect: "color(srgb-linear 0 0.96255 0.93527)",
				},
				{
					args: ["color(display-p3 1 0 1)"],
					expect: "color(srgb-linear 1 0.07188 0.87704)",
				},
			],
		},
		{
			name: "P3 to sRGB whites/blacks, Ray Trace algorithm",
			data: { toSpace: "srgb-linear" , method: "raytrace" },
			tests: [
				{
					args: ["color(display-p3 1 1 1)"],
					expect: "color(srgb-linear 1 1 1)",
				},
				{
					args: ["color(display-p3 2 0 1)"],
					expect: "color(srgb-linear 1 1 1)",
				},
				{
					args: ["color(display-p3 0 0 0)"],
					expect: "color(srgb-linear 0 0 0)",
				},
				{
					args: ["color(display-p3 -1 0 0)"],
					expect: "color(srgb-linear 0 0 0)",
				},
			],
		},
		{
			name: "Misc Conversions, Ray Trace algorithm",
			data: { method: "raytrace" },
			tests: [
				{
					args: ["color(--hpluv 50 110 50)"],
					expect: "color(--hpluv 50.737 100 50.044)",
				},
				{
					args: ["color(--okhsv 50 1.1 0.5)"],
					expect: "color(--okhsv 50 1 0.48745)",
				},
				{
					args: ["color(rec2100-hlg 0.85655 -0.63822 -0.28243)"],
					expect: "color(rec2100-hlg 0.85655 0.61287 0.28243)",
				},
			],
		},
		{
			name: "Maintains alpha, Ray Trace algorithm",
			data: { toSpace: "srgb-linear", method: "raytrace", checkAlpha: true },
			tests: [
				{
					args: ["color(display-p3 1 1 1 / 1)"],
					expect: "color(srgb-linear 1 1 1)",
				},
				{
					args: ["color(display-p3 1 1 1 / 0.5)"],
					expect: "color(srgb-linear 1 1 1 / 0.5)",
				},
				{
					args: ["color(display-p3 1 1 1 / 0)"],
					expect: "color(srgb-linear 1 1 1 / 0)",
				},
				{
					args: ["color(display-p3 1 0 0 / 1)"],
					expect: "color(srgb-linear 1 0.0342 0.02168)",
				},
				{
					args: ["color(display-p3 1 0 0 / 0.5)"],
					expect: "color(srgb-linear 1 0.0342 0.02168 / 0.5)",
				},
				{
					args: ["color(display-p3 1 0 0 / 0)"],
					expect: "color(srgb-linear 1 0.0342 0.02168 / 0)",
				},
			],
		},
		{
			name: "P3 primaries to sRGB, LCH chroma Reduction",
			data: { toSpace: "srgb", method: "lch.c" },
			tests: [
				{
					args: ["color(display-p3 1 0 0)"],
					expect: "rgb(98.20411139286732% 21.834053137266363% 0%)",
				},
				{
					args: ["color(display-p3 0 1 0)"],
					expect: "rgb(0% 99.7921930734509% 0%)",
				},
				{
					args: ["color(display-p3 0 0 1)"],
					expect: "rgb(0% 0% 100%)",
				},
				{
					args: ["color(display-p3 1 1 0)"],
					expect: "rgb(100% 99.45446271521069% 0%)",
				},

				{
					args: ["color(display-p3 0 1 1)"],
					expect: "rgb(0% 100% 98.93709142382755%)",
				},
				{
					args: ["color(display-p3 1 0 1)"],
					expect: "rgb(100% 8.637212218104592% 98.22133121285436%)",
				},
			],
		},

		{
			name: "P3 primaries to sRGB, HSL saturation reduction",
			data: { method: "hsl.s", toSpace: "sRGB" },
			tests: [
				{
					args: ["color(display-p3 1 0 0)"],
					expect: "rgb(100% 0% 0%)",
				},
				{
					args: ["color(display-p3 0 1 0)"],
					expect: "rgb(0% 75.29% 0%)",
				},
				{
					args: ["color(display-p3 0 0 1)"],
					expect: "rgb(0% 0% 100%)",
				},
				{
					args: ["color(display-p3 1 1 0)"],
					expect: "rgb(84.872% 84.872% 0%)",
				},
				{
					args: ["color(display-p3 0 1 1)"],
					expect: "rgb(0% 76.098% 75.455%))",
				},
				{
					args: ["color(display-p3 1 0 1)"],
					expect: "rgb(100% 0% 100%)",
				},
			],
		},
		{
			name: "Using clipping",
			data: { method: "clip", toSpace: "sRGB" },
			tests: [
				{
					args: ["color(display-p3 1 0 0)"],
					expect: "rgb(100% 0% 0%)",
				},
				{
					args: ["color(display-p3 0 1 0)"],
					expect: "rgb(0% 100% 0%)",
				},
				{
					args: ["color(display-p3 0 0 1)"],
					expect: "rgb(0% 0% 100%)",
				},
			],
		},
		{
			name: "P3 primaries to sRGB, HCT chroma reduction",
			data: { method: "hct", toSpace: "sRGB" },
			tests: [
				{
					args: ["color(display-p3 1 0 0)"],
					expect: "rgb(100% 5.7911% 0%)",
				},
				{
					args: ["color(display-p3 0 1 0)"],
					expect: "rgb(0% 99.496% 0%)",
				},
				{
					args: ["color(display-p3 0 0 1)"],
					expect: "rgb(0% 0% 100%)",
				},
				{
					args: ["color(display-p3 1 1 0)"],
					expect: "rgb(99.749% 99.792% 0%)",
				},
				{
					args: ["color(display-p3 0 1 1)"],
					expect: "rgb(0% 100% 99.135%)",
				},
				{
					args: ["color(display-p3 1 0 1)"],
					expect: "rgb(100% 13.745% 96.626%)",
				},
			],
		},
		{
			name: "HCT Gamut Mapping. Demonstrates tonal palettes (blue).",
			data: { toSpace: "srgb", method: "hct-tonal", convertAfter: true },
			tests: [
				{
					args: ["color(--hct 282.762176394358 87.22803916105873 0)"],
					expect: "rgb(0% 0% 0%)",
				},
				{
					args: ["color(--hct 282.762176394358 87.22803916105873 5)"],
					expect: "rgb(0% 0.07618% 30.577%)",
				},
				{
					args: ["color(--hct 282.762176394358 87.22803916105873 10)"],
					expect: "rgb(0% 0.12788% 43.024%)",
				},
				{
					args: ["color(--hct 282.762176394358 87.22803916105873 15)"],
					expect: "rgb(0% 0.16162% 54.996%)",
				},
				{
					args: ["color(--hct 282.762176394358 87.22803916105873 20)"],
					expect: "rgb(0% 0.16388% 67.479%)",
				},
				{
					args: ["color(--hct 282.762176394358 87.22803916105873 25)"],
					expect: "rgb(0% 0.10802% 80.421%)",
				},
				{
					args: ["color(--hct 282.762176394358 87.22803916105873 30)"],
					expect: "rgb(0% 0% 93.775%)",
				},
				{
					args: ["color(--hct 282.762176394358 87.22803916105873 35)"],
					expect: "rgb(10.099% 12.729% 100%)",
				},
				{
					args: ["color(--hct 282.762176394358 87.22803916105873 40)"],
					expect: "rgb(20.18% 23.826% 100%)",
				},
				{
					args: ["color(--hct 282.762176394358 87.22803916105873 50)"],
					expect: "rgb(35.097% 39.075% 100%)",
				},
				{
					args: ["color(--hct 282.762176394358 87.22803916105873 60)"],
					expect: "rgb(48.508% 51.958% 100%)",
				},
				{
					args: ["color(--hct 282.762176394358 87.22803916105873 70)"],
					expect: "rgb(61.603% 64.093% 100%)",
				},
				{
					args: ["color(--hct 282.762176394358 87.22803916105873 80)"],
					expect: "rgb(74.695% 75.961% 100%)",
				},
				{
					args: ["color(--hct 282.762176394358 87.22803916105873 90)"],
					expect: "rgb(87.899% 87.77% 100%)",
				},
				{
					args: ["color(--hct 282.762176394358 87.22803916105873 95)"],
					expect: "rgb(94.558% 93.686% 100%)",
				},
				{
					args: ["color(--hct 282.762176394358 87.22803916105873 100)"],
					expect: "rgb(100% 100% 100%)",
				},
			],
		},
	],
};
