import isValid from "../src/isValid.js";

const tests = {
	name: "Color isValid Tests",
	description: "Test a color string can be parsed into a color object",
	run: isValid,
	tests: [
		{
			name: "none values",
			tests: [
				{
					name: "none hue in lch()",
					args: "lch(90 0 none)",
					expect: true,
				},
				{
					name: "none hue in oklch()",
					args: "oklch(1 0 none)",
					expect: true,
				},
				{
					name: "none hue in hsl()",
					args: "hsl(none, 50%, 50%)",
					expect: true,
				},
				{
					name: "none hue in hwb()",
					args: "hwb(none 20% 30%)",
					expect: true,
				},
				{
					name: "none alpha in oklch()",
					args: "oklch(1 0  120 / none)",
					expect: true,
				},
				{
					name: "none red in color(display-p3)",
					args: "color(display-p3 none 1 .5)",
					expect: true,
				},
			],
		},
		{
			name: "NaN values",
			tests: [
				{
					name: "NaN hue in lch()",
					arg: "lch(NaN 10 50)",
					expect: true,
				},
				{
					name: "calc(NaN) hue in lch()",
					arg: "lch(calc(NaN) 10 50)",
					expect: true,
				},
			],
		},
		{
			name: "sRGB colors",
			tests: [
				{
					name: "Color keyword",
					args: "blue",
					expect: true,
				},
				{
					name: "Color keyword",
					args: "transparent",
					expect: true,
				},
				{
					name: ">>> #rrggbb",
					args: "#ff0066",
					expect: true,
				},
				{
					name: "#rgb",
					args: "#f06",
					expect: true,
				},
				{
					name: "#rrggbbaa",
					args: "#ff006688",
					expect: true,
				},
				{
					name: "#rgba",
					args: "#f068",
					expect: true,
				},
				{
					name: "Wrong number of characters (2) in hexadecimal notation",
					args: "#12",
					expect: false,
				},
				{
					name: "Wrong number of characters (5) in hexadecimal notation",
					args: "#12345",
					expect: false,
				},
				{
					name: "Wrong number of characters (7) in hexadecimal notation",
					args: "#1234567",
					expect: false,
				},
				{
					name: "Wrong number of characters (9) in hexadecimal notation",
					args: "#123456789",
					expect: false,
				},
				{
					name: "rgba(% % % / a)",
					args: "rgba(0% 50% 200% / 0.5)",
					expect: true,
				},
				{
					name: "rgb(r g b / a)",
					args: "rgb(0 127.5 300 / .5)",
					expect: true,
				},
				{
					name: "rgba(n, n, n, a)",
					args: "rgba(0, 127.5, 300, 0.5)",
					expect: true,
				},
				{
					name: "angles not allowed in rgb()",
					args: "rgb(10deg 10 10)",
					expect: false,
				},
			],
		},
		{
			name: "Lab and LCH colors",
			tests: [
				{
					args: "lab(100% 0 0)",
					expect: true,
				},
				{
					name: "case",
					args: "Lab(100% 0 0)",
					expect: true,
				},
				{
					name: "no percent",
					args: "lab(80 0 0)",
					expect: true,
				},
				{
					args: "lab(100 -50 50)",
					expect: true,
				},
				{
					name: "lab percentage",
					args: "lab(50% 25% -25% / 50%)",
					expect: true,
				},
				{
					name: "lab transparency",
					args: "lab(100 -50 5 / .5)",
					expect: true,
				},
				{
					args: "lch(100% 0 0)",
					expect: true,
				},
				{
					name: "no percentage",
					args: "lch(100 50 50)",
					expect: true,
				},
				{
					name: "lch percentage",
					args: "lch(50% 50% 50 / 50%)",
					expect: true,
				},
				{
					name: "Hue over 360",
					args: "lch(100 50 450)",
					expect: true,
				},
			],
		},
		{
			name: "Oklab colors",
			tests: [
				{
					args: "oklab(100% 0 0)",
					expect: true,
				},
				{
					name: "alpha",
					args: "oklab(100% 0 0 / 0.5)",
					expect: true,
				},
				{
					name: "case",
					args: "OKLab(100% 0 0)",
					expect: true,
				},
				{
					name: "all percentages",
					args: "oklab(42% 100% -50%)",
					expect: true,
				},
				{
					name: "all numbers",
					args: "oklab(1 -0.20 0.20)",
					expect: true,
				},
				{
					name: "all numbers out of range",
					args: "oklab(10 -0.80 0.80)",
					expect: true,
				},
			],
		},
		{
			name: "Oklch colors",
			tests: [
				{
					args: "oklch(100% 0 0)",
					expect: true,
				},
				{
					name: "alpha",
					args: "oklch(100% 0 0 / 50%)",
					expect: true,
				},
				{
					name: "case",
					args: "OKLch(100% 0 0)",
					expect: true,
				},
				{
					name: "all numbers",
					args: "oklch(1 0.2 50)",
					expect: true,
				},
				{
					name: "all numbers out of range",
					args: "oklch(10 2 500 / 10)",
					expect: true,
				},
				{
					name: "C as percentage",
					args: "oklch(100% 50% 50)",
					expect: true,
				},
				{
					name: "C as percentage over 100%",
					args: "oklch(100% 150% 50)",
					expect: true,
				},
				{
					name: "H as degrees",
					args: "oklch(100% 0 30deg)",
					expect: true,
				},
			],
		},
		{
			name: "color()",
			tests: [
				{
					args: "color(srgb 0 1 .5)",
					expect: true,
				},
				{
					args: "color(srgb 0 100% 50%)",
					expect: true,
				},
				{
					args: "color(srgb-linear 0 1 .5)",
					expect: true,
				},
				{
					args: "color(srgb-linear 0 100% 50%)",
					expect: true,
				},
				{
					args: "color(display-p3 0 1 .5)",
					expect: true,
				},
				{
					args: "color(display-p3 0% 100% 50%)",
					expect: true,
				},
				{
					args: "color(display-p3-linear 0 1 .5)",
					expect: true,
				},
				{
					args: "color(--display-p3-linear 0% 100% 50%)",
					expect: true,
				},
				{
					args: "color(rec2020 0 1 .5)",
					expect: true,
				},
				{
					args: "color(rec2020 0 100% 50%)",
					expect: true,
				},
				{
					args: "color(rec2020-linear 0 1 .5)",
					expect: true,
				},
				{
					args: "color(--rec2020-linear 0 100% 50%)",
					expect: true,
				},
				{
					args: "color(rec2100-hlg 0 100% 50%)",
					expect: true,
				},
				{
					args: "color(--rec2100-hlg 0 100% 50%)",
					expect: true,
				},
				{
					args: "color(rec2100-pq 0 100% 50%)",
					expect: true,
				},
				{
					args: "color(--rec2100-pq 0 100% 50%)",
					expect: true,
				},
				{
					args: "color(a98-rgb 0 1 .5)",
					expect: true,
				},
				{
					args: "color(a98-rgb 0 100% 50%)",
					expect: true,
				},
				{
					args: "color(a98-rgb-linear 0 1 .5)",
					expect: true,
				},
				{
					args: "color(--a98-rgb-linear 0 100% 50%)",
					expect: true,
				},
				{
					args: "color(prophoto-rgb 0 1 .5)",
					expect: true,
				},
				{
					args: "color(prophoto-rgb 0 100% 50%)",
					expect: true,
				},
				{
					args: "color(prophoto-rgb-linear 0 1 .5)",
					expect: true,
				},
				{
					args: "color(--prophoto-rgb-linear 0 100% 50%)",
					expect: true,
				},
				{
					args: "color(acescc 0 1 .5)",
					expect: true,
				},
				{
					args: "color(--acescc 0 100% 50%)",
					expect: true,
				},
				{
					args: "color(acescg 0 1 .5)",
					expect: true,
				},
				{
					args: "color(--acescg 0 100% 50%)",
					expect: true,
				},
				{
					args: "color(xyz 0 1 .5)",
					expect: true,
				},
				{
					args: "color(xyz 0 100% 50%)",
					expect: true,
				},
				{
					args: "color(xyz-d65 0 1 .5)",
					expect: true,
				},
				{
					args: "color(xyz-d65 0 100% 50%)",
					expect: true,
				},
				{
					args: "color(xyz-d50 0 1 .5)",
					expect: true,
				},
				{
					args: "color(xyz-d50 0 100% 50%)",
					expect: true,
				},
				{
					args: "color(--xyz-abs-d65 0 100% 50%)",
					expect: true,
				},
				{
					args: "color(jzazbz 0 25% -50%)",
					expect: true,
				},
				{
					args: "color(--jzazbz 0 25% -50%)",
					expect: true,
				},
				{
					args: "color(jzczhz 0 0.5 75%)",
					expect: true,
				},
				{
					args: "color(--jzczhz 0 0.5 75%)",
					expect: true,
				},
				{
					args: "color(--hct 0.25turn 50% 25)",
					expect: true,
				},
				{
					args: "color(--hsv 25deg 50% 75)",
					expect: true,
				},
				{
					args: "color(--cam16-jmh 25 50 75)",
					expect: true,
				},
				{
					args: "color(--hpluv 25deg 50% 75)",
					expect: true,
				},
				{
					args: "color(--hsluv 25deg 50% 75)",
					expect: true,
				},
				{
					args: "color(ictcp 0.5 0 0.25)",
					expect: true,
				},
				{
					args: "color(--ictcp 0.5 0 0.25)",
					expect: true,
				},
				// {
				// 	args: "color(--lchuv 50% 0 25deg)",
				// 	expect: true,
				// },
				{
					args: "color(--luv 50% 1 -1)",
					expect: true,
				},
				{
					name: "With transparency",
					args: "color(display-p3 0 1 0 / .5)",
					expect: true,
				},
				{
					name: "No arguments",
					args: "color(display-p3)",
					expect: false,
				},
				{
					name: "No arguments / alpha",
					args: "color(display-p3 / .5)",
					expect: false,
				},
				{
					name: "Fewer arguments",
					args: "color(display-p3 1)",
					expect: false,
				},
				{
					name: "Fewer arguments / alpha",
					args: "color(display-p3 1 / .5)",
					expect: false,
				},
				// {
				// 	name: "More arguments",
				// 	args: "color(display-p3 1 1 1 1)",
				// 	expect: false,
				// },
				{
					name: "More arguments / alpha",
					args: "color(display-p3 1 1 1 1 / .5)",
					expect: false,
				},
			],
		},
		{
			name: "hsl()",
			tests: [
				{
					name: "hsl(), commas",
					args: "hsl(180, 50%, 50%)",
					expect: true,
				},
				{
					name: "hsl(), negative hue",
					args: "hsl(-180, 50%, 50%)",
					expect: true,
				},
				{
					name: "hsl(), hue > 360",
					args: "hsl(900, 50%, 50%)",
					expect: true,
				},
				{
					name: "hsla(), degrees for hue, spaces and slash",
					args: "hsl(90deg 0% 0% / .5)",
					expect: true,
				},
				{
					name: "hsla(), rad for hue, spaces and slash",
					args: "hsl(1.5707963267948966rad 0% 0% / .5)",
					expect: true,
				},
				{
					name: "hsla(), grad for hue, spaces and slash",
					args: "hsl(100grad 0% 0% / .5)",
					expect: true,
				},
				{
					name: "hsla(), turns for hue, spaces and slash",
					args: "hsl(0.25turn 0% 0% / .5)",
					expect: true,
				},
				{
					name: "hsla(), oog color(rec2020 0 0 1)",
					args: "hsl(230.6 179.7% 37.56% / 1)",
					expect: true,
				},
			],
		},
		{
			name: "hwb()",
			tests: [
				{
					args: "hwb(180 20% 30%)",
					expect: true,
				},
				{
					args: "hwb(180 20 30)",
					expect: true,
				},
			],
		},
		{
			name: "Different number formats",
			tests: [
				{
					args: "color(srgb +0.9 0 0)",
					expect: true,
				},
				{
					args: "color(srgb .9 0 0)",
					expect: true,
				},
				{
					args: "color(srgb 9e-1 0 0)",
					expect: true,
				},
				{
					args: "color(srgb 9E-1 0 0)",
					expect: true,
				},
				{
					args: "color(srgb 0.09e+1 0 0)",
					expect: true,
				},
				{
					args: "color(srgb 0.09e1 0 0)",
					expect: true,
				},
			],
		},
	],
};

export default tests;
