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
		return new Color(c).coords;
	},
	check: check.deep(check.proximity({ epsilon: 0.01 })),
	tests: [
		{
			name: "P3 primaries to sRGB",
			data: {toSpace: "srgb"},
			tests: [
				{
					name: "Using chroma reduction",
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
						},
					]
				},
				{
					name: "Using HSL saturation reduction",
					data: {method: "hsl.s"},
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
						{
							args: ["color(display-p3 1 1 0)"],
							expect: "rgb(100% 100% 0%)"
						},
						{
							args: ["color(display-p3 0 1 1)"],
							expect: "rgb(0% 100% 100%)"
						},
						{
							args: ["color(display-p3 1 0 1)"],
							expect: "rgb(100% 0% 100%)"
						}
					]
				},
				{
					name: "Using clipping",
					data: {method: "clip"},
					tests: [
						{
							args: ["color(display-p3 1 0 0)"],
							expect: "rgb(100% 0% 0%)"
						},
						{
							args: ["color(display-p3 0 1 0)"],
							expect: "rgb(0% 100% 0%)"
						},
					]
				},
			]
		},
	]
};
