import Color from "../src/index.js";
import * as check from "../node_modules/htest.dev/src/check.js";

export default {
	name: "Contrast Tests",
	run (fg, bg, method = this.data.method) {
		return new Color(bg).contrast(fg, method);
	},
	check: check.proximity({ epsilon: 0.0001 }),
	tests: [
		{
			name: "WCAG 2.1 contrast, sRGB",
			data: {
				method: "wcag21",
			},
			tests: [
				{
					args: ["white", "black"],
					expect: 21,
				},
				{
					args: ["white", "white"],
					expect: 1,
				},
				{
					args: ["#ffe", "white"],
					expect: 1.01007,
				},
				{
					args: ["#afbaae", "white"],
					expect: 2.008125,
				},
				{
					args: ["#8b9986", "white"],
					expect: 3.000644,
				},
				{
					args: ["#765", "white"],
					expect: 5.502984,
				},
			],
		},
		{
			name: "WCAG 2.1 contrast, Display P3",
			data: {
				method: "wcag21",
			},
			tests: [
				{
					// same as 3.00 above but p3
					args: ["color(display-p3 0.555354 0.5982801 0.5316741)", "white"],
					expect: 3.000644,
				},
			],
		},
		{
			name: "WCAG 2.1 contrast, LCH",
			data: {
				method: "wcag21",
			},
			tests: [
				{
					args: ["lch(50% 0 0)", "white"],
					expect: 4.4836,
				},
			],
		},
		{
			name: "WCAG 2.1 contrast, With none",
			data: {
				method: "wcag21",
			},
			tests: [
				{
					args: ["lch(50% 0 none)", "white"],
					expect: 4.4836,
				},
			],
		},
		{
			// Test results from https://github.com/Myndex/apca-w3/blob/master/test/test.html. First color is text, second is background.
			name: "APCA contrast, sRGB",
			data: {
				method: "apca",
			},
			tests: [
				{
					args: ["#888", "#fff"],
					expect: 63.056469930209424,
				},
				{
					args: ["#fff", "#888"],
					expect: -68.54146436644962,
				},
				{
					args: ["#000", "#aaa"],
					expect: 58.146262578561334,
				},
				{
					args: ["#aaa", "#000"],
					expect: -56.24113336839742,
				},
				{
					args: ["#123", "#def"],
					expect: 91.66830811481631,
				},
				{
					args: ["#def", "#123"],
					expect: -93.06770049484275,
				},
				{
					args: ["#123", "#444"],
					expect: 8.32326136957393,
				},
				{
					// confirmed correct with @Myndex
					args: ["#444", "#123"],
					expect: -7.526878460278154,
				},
			],
		},
		{
			// Same colors as previous tests, all in sRGB gamut, in other color spaces. First color is text, second is background.
			name: "APCA contrast, sRGB gamut in other color spaces",
			data: {
				method: "apca",
			},
			tests: [
				{
					args: ["color(display-p3 0.5333333 0.5333333 0.5333333)", "#fff"],
					expect: 63.056469930209424,
				},
				{
					args: ["#fff", "color(prophoto-rgb 0.4590162 0.4590162 0.4590162)"],
					expect: -68.54146436644962,
				},
				{
					args: ["#000", "color(rec2020 0.6301706 0.6301706 0.6301706)"],
					expect: 50.684920919,
				},
				{
					args: ["color(xyz-d65 0.3820622 0.4019778 0.437777)", "#000"],
					expect: -56.24113336839742,
				},
				{
					args: ["hsl(210 50% 13.333333%)", "lch(93.207946% 10.778089 252.00404)"],
					expect: 91.66830811481631,
				},
				{
					args: [
						"oklch(94.162468% 0.0293154 248.13928)",
						"oklch(24.619227% 0.0398483 249.73161)",
					],
					expect: -93.06770049484275,
				},
				{
					args: [
						"color(display-p3 0.0819793 0.1316305 0.1944321)",
						"color(a98-rgb 0.2735638 0.2735638 0.2735638)",
					],
					expect: 8.32326136957393,
				},
				{
					// confirmed correct with @Myndex
					args: ["hwb(0 26.666667% 73.333333%)", "hwb(210 6.6666667% 80%)"],
					expect: -7.526878460278154,
				},
			],
		},
		{
			name: "APCA contrast, outside sRGB gamut",
			data: {
				method: "apca",
			},
			tests: [
				{
					args: ["color(display-p3 1 1 0)", "#fff"],
					expect: 0,
				},
				{
					args: ["color(display-p3 1 1 0)", "#000"],
					expect: -102.29879033895834,
				},
				{
					args: ["#fff", "color(display-p3 1 1 0)"],
					expect: 0,
				},
				{
					args: ["#000", "color(display-p3 1 1 0)"],
					expect: 100.98312326509509,
				},
			],
		},
		{
			// Same test color pairs as https://github.com/Myndex/apca-w3/blob/master/test/test.html
			name: "Lstar contrast, sRGB",
			data: {
				method: "lstar",
			},
			tests: [
				{
					args: ["#888", "#fff"],
					expect: 43.29658976448289,
				},
				{
					args: ["#fff", "#888"],
					expect: 43.29658976448289,
				},
				{
					args: ["#000", "#aaa"],
					expect: 69.61016686067734,
				},
				{
					args: ["#aaa", "#000"],
					expect: 69.61016686067734,
				},
				{
					args: ["#123", "#def"],
					expect: 80.77804435335543,
				},
				{
					args: ["#def", "#123"],
					expect: 80.77804435335543,
				},
				{
					args: ["#123", "#444"],
					expect: 16.42200146571048,
				},
				{
					// confirmed correct with @Myndex
					args: ["#444", "#123"],
					expect: 16.42200146571048,
				},
			],
		},
		{
			// Same test color pairs as https://github.com/Myndex/apca-w3/blob/master/test/test.html
			name: "Weber contrast, sRGB",
			data: {
				method: "weber",
			},
			tests: [
				{
					args: ["#888", "#fff"],
					expect: 3.0617165365103394,
				},
				{
					args: ["#fff", "#888"],
					expect: 3.0617165365103394,
				},
				{
					args: ["#000", "#aaa"],
					expect: 50000,
				},
				{
					args: ["#aaa", "#000"],
					expect: 50000,
				},
				{
					args: ["#123", "#def"],
					expect: 54.745740598838104,
				},
				{
					args: ["#def", "#123"],
					expect: 54.745740598838104,
				},
				{
					args: ["#123", "#444"],
					expect: 2.8480815999063975,
				},
				{
					// confirmed correct with @Myndex
					args: ["#444", "#123"],
					expect: 2.8480815999063975,
				},
			],
		},
		{
			// Same test color pairs as https://github.com/Myndex/apca-w3/blob/master/test/test.html
			name: "Michelson contrast, sRGB",
			data: {
				method: "michelson",
			},
			tests: [
				{
					args: ["#888", "#fff"],
					expect: 0.6048771230917556,
				},
				{
					args: ["#fff", "#888"],
					expect: 0.6048771230917556,
				},
				{
					args: ["#000", "#aaa"],
					expect: 1,
				},
				{
					args: ["#aaa", "#000"],
					expect: 1,
				},
				{
					args: ["#123", "#def"],
					expect: 0.9647550639238472,
				},
				{
					args: ["#def", "#123"],
					expect: 0.9647550639238472,
				},
				{
					args: ["#123", "#444"],
					expect: 0.5874656895134326,
				},
				{
					// confirmed correct with @Myndex
					args: ["#444", "#123"],
					expect: 0.5874656895134326,
				},
			],
		},
	],
};
