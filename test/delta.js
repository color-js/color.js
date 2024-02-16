import Color from "../src/index.js";
import { check } from "./util.mjs";

export default {
	name: "DeltaE tests",
	description: "These tests test the various Delta E algorithms.",
	run (c1, c2, ...args) {
		let color1 = new Color(c1);
		let color2 = new Color(c2);
		return color1.deltaE(color2, this.data);
	},
	check: check.proximity({ epsilon: .0001 }),
	tests: [
		{
			name: "DeltaE 76",
			data: { method: "76" },
			tests: [
				{
					name: "100% L = 100",
					args: ["white", "black"],
					expect: 100,
				},
				{
					name: "0% L = 0",
					args: ["white", "white"],
					expect: 0,
				},
				{
					name: "barely off-white",
					args: ["#fffffe", "white"],
					expect: 0.4966,
				},
				{
					name: "Pythagorean 3,4,5 triangle",
					args: ["lab(50% 30 40)", "lab(50% 0 0)"],
					expect: 50,
				},
				{
					name: "Sharma test 17: large color differences",
					args: ["lab(50% 2.5 0)", "lab(73% 25 -18)"],
					expect: 36.8680,
				},
				{
					name: "Sharma test 18: large color differences",
					args: ["lab(50% 2.5 0)", "lab(61% -5 29)"],
					expect: 31.9100,
				},
				{
					name: "Sharma test 19: large color differences",
					args: ["lab(50% 2.5 0)", "lab(56% -27 -3)"],
					expect: 30.2531,
				},
				{
					name: "Sharma test 20: large color differences",
					args: ["lab(50% 2.5 0)", "lab(58% 24 15)"],
					expect: 27.4089,
				},
				{
					name: "Brilliant Yellow with Hue error",
					args: ["lab(84.25% 5.74 96.00)", "lab(84.46% 8.88 96.49)"],
					expect: 3.1849,
				},
				{
					name: "Brilliant Yellow with low Chroma error",
					args: ["lab(84.25% 5.74 96.00)", "lab(84.52% 5.75 93.09)"],
					expect: 2.9225,
				},
				{
					name: "Brilliant Yellow with high Chroma error",
					args: ["lab(84.25% 5.74 96.00)", "lab(84.37% 5.86 99.42)"],
					expect: 3.4242,
				},
			],
		},
		{
			name: "DeltaE CMC(2:1)",
			description: "Brilliant Yellow test data by BYK-Gardner GmbH.",
			data: { method: "CMC" },
			tests: [
				{
					name: "100% L = 100",
					args: ["white", "black"],
					expect: 33.7401,
				},
				{
					name: "0%L = 0",
					args: ["white", "white"],
					expect: 0,
				},
				{
					name: "barely off-white",
					args: ["#fffffe", "white"],
					expect: 0.7780,
				},
				{
					name: "barely off-white",
					args: ["#fffffe", "lab(100% 0 0)"],
					expect: 0.7780,
				},
				{
					name: "Pythagorean 3,4,5 triangle",
					args: ["lab(50% 30 40)", "lab(50% 0 0)"],
					expect: 19.4894,
				},
				{
					name: "Brilliant Yellow with Hue error",
					args: ["lab(84.25% 5.74 96.00)", "lab(84.46% 8.88 96.49)"],
					expect: 1.6364,
				},
				{
					name: "Brilliant Yellow with low Chroma error",
					args: ["lab(84.25% 5.74 96.00)", "lab(84.52% 5.75 93.09)"],
					expect: 0.8770,
				},
				{
					name: "Brilliant Yellow with high Chroma error",
					args: ["lab(84.25% 5.74 96.00)", "lab(84.37% 5.86 99.42)"],
					expect: 1.0221,
				},
				{
					name: "Sharma test 17: large color differences",
					args: ["lab(50% 2.5 0)", "lab(73% 25 -18)"],
					expect: 37.9233,
				},
				{
					name: "Sharma test 18: large color differences",
					args: ["lab(50% 2.5 0)", "lab(61% -5 29)"],
					expect: 34.4758,
				},
				{
					name: "Sharma test 19: large color differences",
					args: ["lab(50% 2.5 0)", "lab(56% -27 -3)"],
					expect: 38.0618,
				},
				{
					name: "Sharma test 20: large color differences",
					args: ["lab(50% 2.5 0)", "lab(58% 24 15)"],
					expect: 33.3342,
				},
			],
		},
		{
			name: "DeltaE 2000",
			description: `Includes test data and five significant figures expected results from
			<cite>The CIEDE2000 Color-Difference Formula: Implementation Notes,
			Supplementary Test Data, and Mathematical Observations</cite>,
			G. Sharma, W. Wu, E. N. Dalal, <em>Color Research and Application</em>,
			vol. <strong>30</strong>. No. 1, pp. 21-30, February 2005.
			<a href="http://www2.ece.rochester.edu/~gsharma/ciede2000/">http://www2.ece.rochester.edu/~gsharma/ciede2000/</a>`,
			data: { method: "2000" },
			tests: [
				{
					name: "100% L = 100",
					args: ["white", "black"],
					expect: 100,
				},
				{
					name: "0%L = 0",
					args: ["white", "white"],
					expect: 0,
				},
				{
					name: "barely off-white",
					args: ["#fffffe", "white"],
					expect: 0.51125,
				},
				{
					name: "Pythagorean 3,4,5 triangle",
					args: ["lab(50% 30 40)", "lab(50% 0 0)"],
					expect: 24.1218,
				},
				{
					name: "Sharma test 1: signed ΔH",
					args: ["lab(50% 2.6772 -79.7751)", "lab(50% 0 -82.7485)"],
					expect: 2.0425,
				},
				{
					name: "Sharma test 2: signed ΔH",
					args: ["lab(50% 3.1571 -77.2803)", "lab(50% 0 -82.7485)"],
					expect: 2.8615,
				},
				{
					name: "Sharma test 3: signed ΔH",
					args: ["lab(50% 2.8361 -74.0200)", "lab(50% 0 -82.7485)"],
					expect: 3.4412,
				},
				{
					name: "Sharma test 4: signed ΔC",
					args: ["lab(50% -1.3802 -84.2814)", "lab(50% 0 -82.7485)"],
					expect: 1.0000,
				},
				{
					name: "Sharma test 5: signed ΔC",
					args: ["lab(50% -1.1848 -84.8006)", "lab(50% 0 -82.7485)"],
					expect: 1.0000,
				},
				{
					name: "Sharma test 6: signed ΔC",
					args: ["lab(50% -0.9009 -85.5211)", "lab(50% 0 -82.7485)"],
					expect: 1.0000,
				},
				{
					name: "Sharma test 7: arctan hue and mean hue",
					args: ["lab(50% 0 0)", "lab(50% -1 2)"],
					expect: 2.3669,
				},
				{
					name: "Sharma test 8: arctan hue and mean hue",
					args: ["lab(50% -1 2)", "lab(50% 0 0)"],
					expect: 2.3669,
				},
				{
					name: "Sharma test 9: arctan hue and mean hue",
					args: ["lab(50% 2.4900 -0.0010)", "lab(50% -2.4900 0.0009)"],
					expect: 7.1792,
				},
				{
					name: "Sharma test 10: arctan hue and mean hue",
					args: ["lab(50% 2.4900 -0.0010)", "lab(50% -2.4900 0.0010)"],
					expect: 7.1792,
				},
				{
					name: "Sharma test 11: arctan hue and mean hue",
					args: ["lab(50% 2.4900 -0.0010)", "lab(50% -2.4900 0.0011)"],
					expect: 7.2195,
				},
				{
					name: "Sharma test 12: arctan hue and mean hue",
					args: ["lab(50% 2.4900 -0.0010)", "lab(50% -2.4900 0.0012)"],
					expect: 7.2195,
				},
				{
					name: "Sharma test 13: arctan hue and mean hue",
					args: ["lab(50% -0.0010 2.4900)", "lab(50% 0.0009 -2.4900)"],
					expect: 4.8045,
				},
				{
					name: "Sharma test 14: arctan hue and mean hue",
					args: ["lab(50% -0.0010 2.4900)", "lab(50% 0.00010 -2.4900)"],
					expect: 4.8045,
				},
				{
					name: "Sharma test 15: arctan hue and mean hue",
					args: ["lab(50% -0.0010 2.4900)", "lab(50% 0.0011 -2.4900)"],
					expect: 4.7461,
				},
				{
					name: "Sharma test 16: arctan hue and mean hue",
					args: ["lab(50% 2.5 0)", "lab(50% 0 -2.5)"],
					expect: 4.3065,
				},
				{
					name: "Sharma test 17: large color differences",
					args: ["lab(50% 2.5 0)", "lab(73% 25 -18)"],
					expect: 27.1492,
				},
				{
					name: "Sharma test 18: large color differences",
					args: ["lab(50% 2.5 0)", "lab(61% -5 29)"],
					expect: 22.8977,
				},
				{
					name: "Sharma test 19: large color differences",
					args: ["lab(50% 2.5 0)", "lab(56% -27 -3)"],
					expect: 31.9030,
				},
				{
					name: "Sharma test 20: large color differences",
					args: ["lab(50% 2.5 0)", "lab(58% 24 15)"],
					expect: 19.4535,
				},
				{
					name: "Sharma test 21: unit color differences",
					args: ["lab(50% 2.5 0)", "lab(50% 3.1736 0.5854)"],
					expect: 1.0000,
				},
				{
					name: "Sharma test 22: unit color differences",
					args: ["lab(50% 2.5 0)", "lab(50% 3.2972 0)"],
					expect: 1.0000,
				},
				{
					name: "Sharma test 23: unit color differences",
					args: ["lab(50% 2.5 0)", "lab(50% 1.8634 0.5757)"],
					expect: 1.0000,
				},
				{
					name: "Sharma test 24: unit color differences",
					args: ["lab(50% 2.5 0)", "lab(50% 3.2592 0.3350)"],
					expect: 1.0000,
				},
				// from "Improvement to industrial colour-difference
				// evaluation. Vienna: CIE Publication No. 142-2001
				{
					name: "Sharma test 25: CIE Publication No. 142",
					args: [
						"lab(60.2574% -34.0099 36.2677)",
						"lab(60.4626% -34.1751 39.4387)",
					],
					expect: 1.2644,
				},
				{
					name: "Sharma test 26: CIE Publication No. 142",
					args: [
						"lab(63.0109% -31.0961 -5.8663)",
						"lab(62.8187% -29.7946 -4.0864)",
					],
					expect: 1.2630,
				},
				{
					name: "Sharma test 27: CIE Publication No. 142",
					args: [
						"lab(61.2901% 3.7196 -5.3901)",
						"lab(61.4292% 2.2480 -4.9620)",
					],
					expect: 1.8731,
				},
				{
					name: "Sharma test 28: CIE Publication No. 142",
					args: [
						"lab(35.0831% -44.1164 3.7933)",
						"lab(35.0232% -40.0716 1.5901)",
					],
					expect: 1.8645,
				},
				{
					name: "Sharma test 29: CIE Publication No. 142",
					args: [
						"lab(22.7233% 20.0904 -46.6940)",
						"lab(23.0331% 14.9730 -42.5619)",
					],
					expect: 2.0373,
				},
				{
					name: "Sharma test 30: CIE Publication No. 142",
					args: [
						"lab(36.4612% 47.8580 18.3852)",
						"lab(36.2715% 50.5065 21.2231)",
					],
					expect: 1.4146,
				},
				{
					name: "Sharma test 31: CIE Publication No. 142",
					args: [
						"lab(90.8027% -2.0831 1.4410)",
						"lab(91.1528% -1.6435 0.0447)",
					],
					expect: 1.4441,
				},
				{
					name: "Sharma test 32: CIE Publication No. 142",
					args: [
						"lab(90.9257% -0.5406 -0.9208)",
						"lab(88.6381% -0.8985 -0.7239)",
					],
					expect: 1.5381,
				},
				{
					name: "Sharma test 33: CIE Publication No. 142",
					args: [
						"lab(6.7747% -0.2908 -2.4247)",
						"lab(5.8714% -0.0985 -2.2286)",
					],
					expect: 0.6377,
				},
				{
					name: "Sharma test 34: CIE Publication No. 142",
					args: [
						"lab(2.0776% 0.0795 -1.1350)",
						"lab(0.9033% -0.0636 -0.5514)",
					],
					expect: 0.9082,
				},
				{
					name: "Brilliant Yellow with Hue error",
					args: [
						"lab(84.25% 5.74 96.00)",
						"lab(84.46% 8.88 96.49)",
					],
					expect: 1.6743,
				},
				{
					name: "Brilliant Yellow with low Chroma error",
					args: [
						"lab(84.25% 5.74 96.00)",
						"lab(84.52% 5.75 93.09)",
					],
					expect: 0.5887,
				},
				{
					name: "Brilliant Yellow with high Chroma error",
					args: [
						"lab(84.25% 5.74 96.00)",
						"lab(84.37% 5.86 99.42)",
					],
					expect: 0.6395,
				},
			],
		},
		{
			name: "DeltaE ITP",
			description: `Includes test data from
			<cite>The CIEDE2000 Color-Difference Formula: Implementation Notes,
			Supplementary Test Data, and Mathematical Observations</cite>,
			G. Sharma, W. Wu, E. N. Dalal, <em>Color Research and Application</em>,
			vol. <strong>30</strong>. No. 1, pp. 21-30, February 2005.
			<a href="http://www2.ece.rochester.edu/~gsharma/ciede2000/">http://www2.ece.rochester.edu/~gsharma/ciede2000/</a>,
			to help comparison with DeltaE2000 test results.`,
			data: { method: "ITP" },
			tests: [
				{
					name: "100% L = 100",
					args: ["white", "black"],
					expect: 100,
				},
				{
					name: "0%L = 0",
					args: ["white", "white"],
					expect: 0,
				},
				{
					name: "barely off-white",
					args: ["#fffffe", "white"],
					expect: 0.4966,
				},
				{
					name: "Pythagorean 3,4,5 triangle",
					args: ["lab(50% 30 40)", "lab(50% 0 0)"],
					expect: 50,
				},
				{
					name: "Sharma test 1: signed ΔH",
					args: ["lab(50% 2.6772 -79.7751)", "lab(50% 0 -82.7485)"],
					expect: 2.0425,
				},
				{
					name: "Sharma test 2: signed ΔH",
					args: ["lab(50% 3.1571 -77.2803)", "lab(50% 0 -82.7485)"],
					expect: 2.8615,
				},
				{
					name: "Sharma test 3: signed ΔH",
					args: ["lab(50% 2.8361 -74.0200)", "lab(50% 0 -82.7485)"],
					expect: 3.4412,
				},
				{
					name: "Sharma test 4: signed ΔC",
					args: ["lab(50% -1.3802 -84.2814)", "lab(50% 0 -82.7485)"],
					expect: 1.0000,
				},
				{
					name: "Sharma test 5: signed ΔC",
					args: ["lab(50% -1.1848 -84.8006)", "lab(50% 0 -82.7485)"],
					expect: 1.0000,
				},
				{
					name: "Sharma test 6: signed ΔC",
					args: ["lab(50% -0.9009 -85.5211)", "lab(50% 0 -82.7485)"],
					expect: 1.0000,
				},
				{
					name: "Sharma test 7: arctan hue and mean hue",
					args: ["lab(50% 0 0)", "lab(50% -1 2)"],
					expect: 2.3669,
				},
				{
					name: "Sharma test 8: arctan hue and mean hue",
					args: ["lab(50% -1 2)", "lab(50% 0 0)"],
					expect: 2.3669,
				},
				{
					name: "Sharma test 9: arctan hue and mean hue",
					args: ["lab(50% 2.4900 -0.0010)", "lab(50% -2.4900 0.0009)"],
					expect: 7.1792,
				},
				{
					name: "Sharma test 10: arctan hue and mean hue",
					args: ["lab(50% 2.4900 -0.0010)", "lab(50% -2.4900 0.0010)"],
					expect: 7.1792,
				},
				{
					name: "Sharma test 11: arctan hue and mean hue",
					args: ["lab(50% 2.4900 -0.0010)", "lab(50% -2.4900 0.0011)"],
					expect: 7.2195,
				},
				{
					name: "Sharma test 12: arctan hue and mean hue",
					args: ["lab(50% 2.4900 -0.0010)", "lab(50% -2.4900 0.0012)"],
					expect: 7.2195,
				},
				{
					name: "Sharma test 13: arctan hue and mean hue",
					args: ["lab(50% -0.0010 2.4900)", "lab(50% 0.0009 -2.4900)"],
					expect: 4.8045,
				},
				{
					name: "Sharma test 14: arctan hue and mean hue",
					args: ["lab(50% -0.0010 2.4900)", "lab(50% 0.00010 -2.4900)"],
					expect: 4.8045,
				},
				{
					name: "Sharma test 15: arctan hue and mean hue",
					args: ["lab(50% -0.0010 2.4900)", "lab(50% 0.0011 -2.4900)"],
					expect: 4.7461,
				},
				{
					name: "Sharma test 16: arctan hue and mean hue",
					args: ["lab(50% 2.5 0)", "lab(50% 0 -2.5)"],
					expect: 4.3065,
				},
				{
					name: "Sharma test 17: large color differences",
					args: ["lab(50% 2.5 0)", "lab(73% 25 -18)"],
					expect: 27.1492,
				},
				{
					name: "Sharma test 18: large color differences",
					args: ["lab(50% 2.5 0)", "lab(61% -5 29)"],
					expect: 22.8977,
				},
				{
					name: "Sharma test 19: large color differences",
					args: ["lab(50% 2.5 0)", "lab(56% -27 -3)"],
					expect: 31.9030,
				},
				{
					name: "Sharma test 20: large color differences",
					args: ["lab(50% 2.5 0)", "lab(58% 24 15)"],
					expect: 19.4535,
				},
				{
					name: "Sharma test 21: unit color differences",
					args: ["lab(50% 2.5 0)", "lab(50% 3.1736 0.5854)"],
					expect: 1.0000,
				},
				{
					name: "Sharma test 22: unit color differences",
					args: ["lab(50% 2.5 0)", "lab(50% 3.2972 0)"],
					expect: 1.0000,
				},
				{
					name: "Sharma test 23: unit color differences",
					args: ["lab(50% 2.5 0)", "lab(50% 1.8634 0.5757)"],
					expect: 1.0000,
				},
				{
					name: "Sharma test 24: unit color differences",
					args: ["lab(50% 2.5 0)", "lab(50% 3.2592 0.3350)"],
					expect: 1.0000,
				},
				// from "Improvement to industrial colour-difference
				// evaluation. Vienna: CIE Publication No. 142-2001
				{
					name: "Sharma test 25: CIE Publication No. 142",
					args: [
						"lab(60.2574% -34.0099 36.2677)",
						"lab(60.4626% -34.1751 39.4387)",
					],
					expect: 1.2644,
				},
				{
					name: "Sharma test 26: CIE Publication No. 142",
					args: [
						"lab(63.0109% -31.0961 -5.8663)",
						"lab(62.8187% -29.7946 -4.0864)",
					],
					expect: 1.2630,
				},
				{
					name: "Sharma test 27: CIE Publication No. 142",
					args: [
						"lab(61.2901% 3.7196 -5.3901)",
						"lab(61.4292% 2.2480 -4.9620)",
					],
					expect: 1.8731,
				},
				{
					name: "Sharma test 28: CIE Publication No. 142",
					args: [
						"lab(35.0831% -44.1164 3.7933)",
						"lab(35.0232% -40.0716 1.5901)",
					],
					expect: 1.8645,
				},
				{
					name: "Sharma test 29: CIE Publication No. 142",
					args: [
						"lab(22.7233% 20.0904 -46.6940)",
						"lab(23.0331% 14.9730 -42.5619)",
					],
					expect: 2.0373,
				},
				{
					name: "Sharma test 30: CIE Publication No. 142",
					args: [
						"lab(36.4612% 47.8580 18.3852)",
						"lab(36.2715% 50.5065 21.2231)",
					],
					expect: 1.4146,
				},
				{
					name: "Sharma test 31: CIE Publication No. 142",
					args: [
						"lab(90.8027% -2.0831 1.4410)",
						"lab(91.1528% -1.6435 0.0447)",
					],
					expect: 1.4441,
				},
				{
					name: "Sharma test 32: CIE Publication No. 142",
					args: [
						"lab(90.9257% -0.5406 -0.9208)",
						"lab(88.6381% -0.8985 -0.7239)",
					],
					expect: 1.5381,
				},
				{
					name: "Sharma test 33: CIE Publication No. 142",
					args: [
						"lab(6.7747% -0.2908 -2.4247)",
						"lab(5.8714% -0.0985 -2.2286)",
					],
					expect: 0.6377,
				},
				{
					name: "Sharma test 34: CIE Publication No. 142",
					args: [
						"lab(2.0776% 0.0795 -1.1350)",
						"lab(0.9033% -0.0636 -0.5514)",
					],
					expect: 0.9082,
				},
				{
					name: "Brilliant Yellow with Hue error",
					args: [
						"lab(84.25% 5.74 96.00)",
						"lab(84.46% 8.88 96.49)",
					],
					expect: 1.6364,
				},
				{
					name: "Brilliant Yellow with low Chroma error",
					args: [
						"lab(84.25% 5.74 96.00)",
						"lab(84.52% 5.75 93.09)",
					],
					expect: 0.5887,
				},
				{
					name: "Brilliant Yellow with high Chroma error",
					args: [
						"lab(84.25% 5.74 96.00)",
						"lab(84.37% 5.86 99.42)",
					],
					expect: 0.6395,
				},
			],
		},
		{
			name: "DeltaE Jz",
			data: {method: "Jz"},
			tests: [
				{
					name: "100% L = 100",
					args: ["white", "black"],
					expect: 0.222065,
				},
				{
					name: "0%L = 0",
					args: ["white", "white"],
					expect: 0,
				},
				{
					name: "barely off-white",
					args: ["#fffffe", "white"],
					expect: 0.00048,
				},
				{
					name: "Pythagorean 3,4,5 triangle",
					args: [
						"color(jzazbz 0.1 0.03 0.04)",
						"color(jzazbz 0.1 0 0)",
					],
					expect: 0.05,
				},
				{
					name: "Sharma test 17: large color differences",
					args: ["lab(50% 2.5 0)", "lab(73% 25 -18)"],
					expect: 0.070538,
				},
				{
					name: "Sharma test 18: large color differences",
					args: ["lab(50% 2.5 0)", "lab(61% -5 29)"],
					expect: 0.059699,
				},
				{
					name: "Sharma test 19: large color differences",
					args: ["lab(50% 2.5 0)", "lab(56% -27 -3)"],
					expect: 0.039590,
				},
				{
					name: "Sharma test 20: large color differences",
					args: ["lab(50% 2.5 0)", "lab(58% 24 15)"],
					expect: 0.051967,
				},
				{
					name: "Brilliant Yellow with Hue error",
					args: ["lab(84.25% 5.74 96.00)", "lab(84.46% 8.88 96.49)"],
					expect: 0.008447,
				},
				{
					name: "Brilliant Yellow with low Chroma error",
					args: ["lab(84.25% 5.74 96.00)", "lab(84.52% 5.75 93.09)"],
					expect: 0.002969,
				},
				{
					name: "Brilliant Yellow with high Chroma error",
					args: ["lab(84.25% 5.74 96.00)", "lab(84.37% 5.86 99.42)"],
					expect: 0.003113,
				},
			],
		},
		{
			name: "DeltaE OK",
			description: "These values average 200x smaller than the corresponding deltaE 2000 values.",
			data: {method: "OK"},
			tests: [
				{
					name: "100% L = 100",
					args: ["white", "black"],
					expect: 1,
				},
				{
					name: "0%L = 0",
					args: ["white", "white"],
					expect: 0,
				},
				{
					name: "barely off-white",
					args: ["#fffffe", "white"],
					expect: 0.001343,
				},
				{
					name: "Pythagorean 3,4,5 triangle",
					args: ["lab(50% 30 40)", "lab(50% 0 0)"],
					expect: 0.118679,
				},
				{
					name: "Sharma test 17: large color differences",
					args: ["lab(50% 2.5 0)", "lab(73% 25 -18)"],
					expect: 0.223724,
				},
				{
					name: "Sharma test 18: large color differences",
					args: ["lab(50% 2.5 0)", "lab(61% -5 29)"],
					expect: 0.117703,
				},
				{
					name: "Sharma test 19: large color differences",
					args: ["lab(50% 2.5 0)", "lab(56% -27 -3)"],
					expect: 0.096109,
				},
				{
					name: "Sharma test 20: large color differences",
					args: ["lab(50% 2.5 0)", "lab(58% 24 15)"],
					expect: 0.103834,
				},
				// from "Improvement to industrial colour-difference
				// evaluation. Vienna: CIE Publication No. 142-2001
				{
					name: "Sharma test 25: CIE Publication No. 142",
					args: [
						"lab(60.2574% -34.0099 36.2677)",
						"lab(60.4626% -34.1751 39.4387)",
					],
					expect: 0.006934,
				},
				{
					name: "Sharma test 26: CIE Publication No. 142",
					args: [
						"lab(63.0109% -31.0961 -5.8663)",
						"lab(62.8187% -29.7946 -4.0864)",
					],
					expect: 0.006478,
				},
				{
					name: "Sharma test 27: CIE Publication No. 142",
					args: [
						"lab(61.2901% 3.7196 -5.3901)",
						"lab(61.4292% 2.2480 -4.9620)",
					],
					expect: 0.004552,
				},
				{
					name: "Sharma test 28: CIE Publication No. 142",
					args: [
						"lab(35.0831% -44.1164 3.7933)",
						"lab(35.0232% -40.0716 1.5901)",
					],
					expect: 0.011480,
				},
				{
					name: "Sharma test 29: CIE Publication No. 142",
					args: [
						"lab(22.7233% 20.0904 -46.6940)",
						"lab(23.0331% 14.9730 -42.5619)",
					],
					expect: 0.014549,
				},
				{
					name: "Sharma test 30: CIE Publication No. 142",
					args: [
						"lab(36.4612% 47.8580 18.3852)",
						"lab(36.2715% 50.5065 21.2231)",
					],
					expect: 0.009265,
				},
				{
					name: "Sharma test 31: CIE Publication No. 142",
					args: [
						"lab(90.8027% -2.0831 1.4410)",
						"lab(91.1528% -1.6435 0.0447)",
					],
					expect: 0.005109,
				},
				{
					name: "Sharma test 32: CIE Publication No. 142",
					args: [
						"lab(90.9257% -0.5406 -0.9208)",
						"lab(88.6381% -0.8985 -0.7239)",
					],
					expect: 0.019893,
				},
				{
					name: "Sharma test 33: CIE Publication No. 142",
					args: [
						"lab(6.7747% -0.2908 -2.4247)",
						"lab(5.8714% -0.0985 -2.2286)",
					],
					expect: 0.009068,
				},
				{
					name: "Sharma test 34: CIE Publication No. 142",
					args: [
						"lab(2.0776% 0.0795 -1.1350)",
						"lab(0.9033% -0.0636 -0.5514)",
					],
					expect: 0.032252,
				},
				{
					name: "Brilliant Yellow with Hue error",
					args: [
						"lab(84.25% 5.74 96.00)",
						"lab(84.46% 8.88 96.49)",
					],
					expect: 0.009285,
				},
				{
					name: "Brilliant Yellow with low Chroma error",
					args: [
						"lab(84.25% 5.74 96.00)",
						"lab(84.52% 5.75 93.09)",
					],
					expect: 0.0039230,
				},
				{
					name: "Brilliant Yellow with high Chroma error",
					args: [
						"lab(84.25% 5.74 96.00)",
						"lab(84.37% 5.86 99.42)",
					],
					expect: 0.003800,
				},
			],
		},
	],
};
