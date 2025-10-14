import ColorSpace from "../src/spaces/index.js";
import parse from "../src/parse.js";

import * as check from "../node_modules/htest.dev/src/check.js";

globalThis.ColorSpace = ColorSpace;

const tests = {
	name: "Color parse Tests",
	description: "These tests parse different color formats and compare the result as JSON",
	run: parse,
	tests: [
		{
			name: "none values",
			tests: [
				{
					name: "none hue in lch()",
					args: "lch(90 0 none)",
					expect: { spaceId: "lch", coords: [90, 0, null], alpha: 1 },
				},
				{
					name: "none hue in oklch()",
					args: "oklch(1 0 none)",
					expect: { spaceId: "oklch", coords: [1, 0, null], alpha: 1 },
				},
				{
					name: "none hue in hsl()",
					args: "hsl(none, 50%, 50%)",
					expect: { spaceId: "hsl", coords: [null, 50, 50], alpha: 1 },
				},
				{
					name: "none hue in hwb()",
					args: "hwb(none 20% 30%)",
					expect: { spaceId: "hwb", coords: [null, 20, 30], alpha: 1 },
				},
				{
					name: "none alpha in oklch()",
					args: "oklch(1 0  120 / none)",
					expect: { spaceId: "oklch", coords: [1, 0, 120], alpha: null },
				},
				{
					name: "none red in color(display-p3)",
					args: "color(display-p3 none 1 .5)",
					expect: { spaceId: "p3", coords: [null, 1, 0.5], alpha: 1 },
				},
			],
		},
		{
			name: "NaN values",
			tests: [
				{
					name: "NaN hue in lch()",
					arg: "lch(NaN 10 50)",
					expect: { spaceId: "lch", coords: [NaN, 10, 50], alpha: 1 },
				},
				{
					name: "calc(NaN) hue in lch()",
					arg: "lch(calc(NaN) 10 50)",
					expect: { spaceId: "lch", coords: [NaN, 10, 50], alpha: 1 },
				},
			],
		},
		{
			name: "sRGB colors",
			tests: [
				{
					name: "Color keyword",
					args: "blue",
					expect: { spaceId: "srgb", coords: [0, 0, 1], alpha: 1 },
				},
				{
					name: "Color keyword",
					args: "transparent",
					expect: { spaceId: "srgb", coords: [0, 0, 0], alpha: 0 },
				},
				{
					name: "#rrggbb",
					args: "#ff0066",
					expect: { spaceId: "srgb", coords: [1, 0, 0.4], alpha: 1 },
				},
				{
					name: "#rgb",
					args: "#f06",
					expect: { spaceId: "srgb", coords: [1, 0, 0.4], alpha: 1 },
				},
				{
					name: "#rrggbbaa",
					args: "#ff006688",
					expect: { spaceId: "srgb", coords: [1, 0, 0.4], alpha: 0.5333333333333333 },
				},
				{
					name: "#rgba",
					args: "#f068",
					expect: { spaceId: "srgb", coords: [1, 0, 0.4], alpha: 0.5333333333333333 },
				},
				{
					name: "Wrong number of characters (2) in hexadecimal notation",
					args: "#12",
					throws: TypeError,
				},
				{
					name: "Wrong number of characters (5) in hexadecimal notation",
					args: "#12345",
					throws: TypeError,
				},
				{
					name: "Wrong number of characters (7) in hexadecimal notation",
					args: "#1234567",
					throws: TypeError,
				},
				{
					name: "Wrong number of characters (9) in hexadecimal notation",
					args: "#123456789",
					throws: TypeError,
				},
				{
					name: "rgba(% % % / a)",
					args: "rgba(0% 50% 200% / 0.5)",
					expect: { spaceId: "srgb", coords: [0, 0.5, 2], alpha: 0.5 },
				},
				{
					name: "rgb(r g b / a)",
					args: "rgb(0 127.5 300 / .5)",
					expect: { spaceId: "srgb", coords: [0, 0.5, 1.1764705882352942], alpha: 0.5 },
				},
				{
					name: "rgba(n, n, n, a)",
					args: "rgba(0, 127.5, 300, 0.5)",
					expect: { spaceId: "srgb", coords: [0, 0.5, 1.1764705882352942], alpha: 0.5 },
				},
				{
					name: "angles not allowed in rgb()",
					args: "rgb(10deg 10 10)",
					throws: TypeError,
				},
			],
		},
		{
			name: "Lab and LCH colors",
			tests: [
				{
					args: "lab(100% 0 0)",
					expect: { spaceId: "lab", coords: [100, 0, 0], alpha: 1 },
				},
				{
					name: "case",
					args: "Lab(100% 0 0)",
					expect: { spaceId: "lab", coords: [100, 0, 0], alpha: 1 },
				},
				{
					name: "no percent",
					args: "lab(80 0 0)",
					expect: { spaceId: "lab", coords: [80, 0, 0], alpha: 1 },
				},
				{
					args: "lab(100 -50 50)",
					expect: { spaceId: "lab", coords: [100, -50, 50], alpha: 1 },
				},
				{
					name: "lab percentage",
					args: "lab(50% 25% -25% / 50%)",
					expect: { spaceId: "lab", coords: [50, 31.25, -31.25], alpha: 0.5 },
				},
				{
					name: "lab transparency",
					args: "lab(100 -50 5 / .5)",
					expect: { spaceId: "lab", coords: [100, -50, 5], alpha: 0.5 },
				},
				{
					args: "lch(100% 0 0)",
					expect: { spaceId: "lch", coords: [100, 0, 0], alpha: 1 },
				},
				{
					name: "no percentage",
					args: "lch(100 50 50)",
					expect: { spaceId: "lch", coords: [100, 50, 50], alpha: 1 },
				},
				{
					name: "lch percentage",
					args: "lch(50% 50% 50 / 50%)",
					expect: { spaceId: "lch", coords: [50, 75, 50], alpha: 0.5 },
				},
				{
					name: "Hue over 360",
					args: "lch(100 50 450)",
					expect: { spaceId: "lch", coords: [100, 50, 450], alpha: 1 },
				},
			],
		},
		{
			name: "Oklab colors",
			tests: [
				{
					args: "oklab(100% 0 0)",
					expect: { spaceId: "oklab", coords: [1, 0, 0], alpha: 1 },
				},
				{
					name: "alpha",
					args: "oklab(100% 0 0 / 0.5)",
					expect: { spaceId: "oklab", coords: [1, 0, 0], alpha: 0.5 },
				},
				{
					name: "case",
					args: "OKLab(100% 0 0)",
					expect: { spaceId: "oklab", coords: [1, 0, 0], alpha: 1 },
				},
				{
					name: "all percentages",
					args: "oklab(42% 100% -50%)",
					expect: { spaceId: "oklab", coords: [0.42, 0.4, -0.2], alpha: 1 },
				},
				{
					name: "all numbers",
					args: "oklab(1 -0.20 0.20)",
					expect: { spaceId: "oklab", coords: [1, -0.2, 0.2], alpha: 1 },
				},
				{
					name: "all numbers out of range",
					args: "oklab(10 -0.80 0.80)",
					expect: { spaceId: "oklab", coords: [10, -0.8, 0.8], alpha: 1 },
				},
			],
		},
		{
			name: "Oklch colors",
			tests: [
				{
					args: "oklch(100% 0 0)",
					expect: { spaceId: "oklch", coords: [1, 0, 0], alpha: 1 },
				},
				{
					name: "alpha",
					args: "oklch(100% 0 0 / 50%)",
					expect: { spaceId: "oklch", coords: [1, 0, 0], alpha: 0.5 },
				},
				{
					name: "case",
					args: "OKLch(100% 0 0)",
					expect: { spaceId: "oklch", coords: [1, 0, 0], alpha: 1 },
				},
				{
					name: "all numbers",
					args: "oklch(1 0.2 50)",
					expect: { spaceId: "oklch", coords: [1, 0.2, 50], alpha: 1 },
				},
				{
					name: "all numbers out of range",
					args: "oklch(10 2 500 / 10)",
					expect: { spaceId: "oklch", coords: [10, 2, 500], alpha: 1 },
				},
				{
					name: "C as percentage",
					args: "oklch(100% 50% 50)",
					expect: { spaceId: "oklch", coords: [1, 0.2, 50], alpha: 1 },
				},
				{
					name: "C as percentage over 100%",
					args: "oklch(100% 150% 50)",
					expect: { spaceId: "oklch", coords: [1, 0.6000000000000001, 50], alpha: 1 },
				},
				{
					name: "H as degrees",
					args: "oklch(100% 0 30deg)",
					expect: { spaceId: "oklch", coords: [1, 0, 30], alpha: 1 },
				},
			],
		},
		{
			name: "color()",
			tests: [
				{
					args: "color(srgb 0 1 .5)",
					expect: { spaceId: "srgb", coords: [0, 1, 0.5], alpha: 1 },
				},
				{
					args: "color(srgb 0 100% 50%)",
					expect: { spaceId: "srgb", coords: [0, 1, 0.5], alpha: 1 },
				},
				{
					args: "color(srgb-linear 0 1 .5)",
					expect: { spaceId: "srgb-linear", coords: [0, 1, 0.5], alpha: 1 },
				},
				{
					args: "color(srgb-linear 0 100% 50%)",
					expect: { spaceId: "srgb-linear", coords: [0, 1, 0.5], alpha: 1 },
				},
				{
					args: "color(display-p3 0 1 .5)",
					expect: { spaceId: "p3", coords: [0, 1, 0.5], alpha: 1 },
				},
				{
					args: "color(display-p3 0% 100% 50%)",
					expect: { spaceId: "p3", coords: [0, 1, 0.5], alpha: 1 },
				},
				{
					args: "color(display-p3-linear 0 1 .5)",
					expect: { spaceId: "p3-linear", coords: [0, 1, 0.5], alpha: 1 },
				},
				{
					args: "color(--display-p3-linear 0% 100% 50%)",
					expect: { spaceId: "p3-linear", coords: [0, 1, 0.5], alpha: 1 },
				},
				{
					args: "color(rec2020 0 1 .5)",
					expect: { spaceId: "rec2020", coords: [0, 1, 0.5], alpha: 1 },
				},
				{
					args: "color(rec2020 0 100% 50%)",
					expect: { spaceId: "rec2020", coords: [0, 1, 0.5], alpha: 1 },
				},
				{
					args: "color(rec2020-linear 0 1 .5)",
					expect: { spaceId: "rec2020-linear", coords: [0, 1, 0.5], alpha: 1 },
				},
				{
					args: "color(--rec2020-linear 0 100% 50%)",
					expect: { spaceId: "rec2020-linear", coords: [0, 1, 0.5], alpha: 1 },
				},
				{
					args: "color(rec2100-hlg 0 100% 50%)",
					expect: { spaceId: "rec2100hlg", coords: [0, 1, 0.5], alpha: 1 },
				},
				{
					args: "color(--rec2100-hlg 0 100% 50%)",
					expect: { spaceId: "rec2100hlg", coords: [0, 1, 0.5], alpha: 1 },
				},
				{
					args: "color(rec2100-pq 0 100% 50%)",
					expect: { spaceId: "rec2100pq", coords: [0, 1, 0.5], alpha: 1 },
				},
				{
					args: "color(--rec2100-pq 0 100% 50%)",
					expect: { spaceId: "rec2100pq", coords: [0, 1, 0.5], alpha: 1 },
				},
				{
					args: "color(a98-rgb 0 1 .5)",
					expect: { spaceId: "a98rgb", coords: [0, 1, 0.5], alpha: 1 },
				},
				{
					args: "color(a98-rgb 0 100% 50%)",
					expect: { spaceId: "a98rgb", coords: [0, 1, 0.5], alpha: 1 },
				},
				{
					args: "color(a98-rgb-linear 0 1 .5)",
					expect: { spaceId: "a98rgb-linear", coords: [0, 1, 0.5], alpha: 1 },
				},
				{
					args: "color(--a98-rgb-linear 0 100% 50%)",
					expect: { spaceId: "a98rgb-linear", coords: [0, 1, 0.5], alpha: 1 },
				},
				{
					args: "color(prophoto-rgb 0 1 .5)",
					expect: { spaceId: "prophoto", coords: [0, 1, 0.5], alpha: 1 },
				},
				{
					args: "color(prophoto-rgb 0 100% 50%)",
					expect: { spaceId: "prophoto", coords: [0, 1, 0.5], alpha: 1 },
				},
				{
					args: "color(prophoto-rgb-linear 0 1 .5)",
					expect: { spaceId: "prophoto-linear", coords: [0, 1, 0.5], alpha: 1 },
				},
				{
					args: "color(--prophoto-rgb-linear 0 100% 50%)",
					expect: { spaceId: "prophoto-linear", coords: [0, 1, 0.5], alpha: 1 },
				},
				{
					args: "color(acescc 0 1 .5)",
					expect: { spaceId: "acescc", coords: [0, 1, 0.5], alpha: 1 },
				},
				{
					args: "color(--acescc 0 100% 50%)",
					expect: {
						spaceId: "acescc",
						coords: [0, 1.4679963120447153, 0.5548547410223577],
						alpha: 1,
					},
				},
				{
					args: "color(acescg 0 1 .5)",
					expect: { spaceId: "acescg", coords: [0, 1, 0.5], alpha: 1 },
				},
				{
					args: "color(--acescg 0 100% 50%)",
					expect: { spaceId: "acescg", coords: [0, 65504, 32752], alpha: 1 },
				},
				{
					args: "color(xyz 0 1 .5)",
					expect: { spaceId: "xyz-d65", coords: [0, 1, 0.5], alpha: 1 },
				},
				{
					args: "color(xyz 0 100% 50%)",
					expect: { spaceId: "xyz-d65", coords: [0, 1, 0.5], alpha: 1 },
				},
				{
					args: "color(xyz-d65 0 1 .5)",
					expect: { spaceId: "xyz-d65", coords: [0, 1, 0.5], alpha: 1 },
				},
				{
					args: "color(xyz-d65 0 100% 50%)",
					expect: { spaceId: "xyz-d65", coords: [0, 1, 0.5], alpha: 1 },
				},
				{
					args: "color(xyz-d50 0 1 .5)",
					expect: { spaceId: "xyz-d50", coords: [0, 1, 0.5], alpha: 1 },
				},
				{
					args: "color(xyz-d50 0 100% 50%)",
					expect: { spaceId: "xyz-d50", coords: [0, 1, 0.5], alpha: 1 },
				},
				{
					args: "color(--xyz-abs-d65 0 100% 50%)",
					expect: { spaceId: "xyz-abs-d65", coords: [0, 10000, 5444.15], alpha: 1 },
				},
				{
					args: "color(--hct 0.25turn 50% 25)",
					expect: { spaceId: "hct", coords: [90, 72.5, 25], alpha: 1 },
				},
				{
					args: "color(--hsv 25deg 50% 75)",
					expect: { spaceId: "hsv", coords: [25, 50, 75], alpha: 1 },
				},
				{
					args: "color(--cam16-jmh 25 50 75)",
					expect: { spaceId: "cam16-jmh", coords: [25, 50, 75], alpha: 1 },
				},
				{
					args: "color(--hpluv 25deg 50% 75)",
					expect: { spaceId: "hpluv", coords: [25, 50, 75], alpha: 1 },
				},
				{
					args: "color(--hsluv 25deg 50% 75)",
					expect: { spaceId: "hsluv", coords: [25, 50, 75], alpha: 1 },
				},
				{
					args: "color(--lchuv 50% 0 25deg)",
					expect: { spaceId: "lchuv", coords: [50, 0, 25], alpha: 1 },
				},
				{
					args: "color(--luv 50% 1 -1)",
					expect: { spaceId: "luv", coords: [50, 1, -1], alpha: 1 },
				},
				{
					name: "With transparency",
					args: "color(display-p3 0 1 0 / .5)",
					expect: { spaceId: "p3", coords: [0, 1, 0], alpha: 0.5 },
				},
				{
					name: "No arguments",
					args: "color(display-p3)",
					throws: true,
				},
				{
					name: "No arguments / alpha",
					args: "color(display-p3 / .5)",
					throws: true,
				},
				{
					name: "Fewer arguments",
					args: "color(display-p3 1)",
					throws: true,
				},
				{
					name: "Fewer arguments / alpha",
					args: "color(display-p3 1 / .5)",
					throws: true,
				},
				{
					name: "More arguments",
					args: "color(display-p3 1 1 1 1)",
					throws: true,
				},
				{
					name: "More arguments / alpha",
					args: "color(display-p3 1 1 1 1 / .5)",
					throws: true,
				},
			],
		},
		{
			name: "jzazbz() and jzczhz",
			tests: [
				{
					name: "Jzazbz, no alpha",
					args: "jzazbz(0 25% -50%)",
					expect: {
						spaceId: "jzazbz",
						coords: [0, 0.05250000000000002, -0.105],
						alpha: 1,
					},
				},
				{
					name: "Jzazbz, with alpha",
					args: "jzazbz(0 -10% 30% / 0.7)",
					expect: {
						spaceId: "jzazbz",
						coords: [0, -0.02099999999999999, 0.06300000000000003],
						alpha: 0.7,
					},
				},
				{
					name: "JzCzhz, no alpha",
					args: "jzczhz(0.2 0.15 120deg)",
					expect: { spaceId: "jzczhz", coords: [0.2, 0.15, 120], alpha: 1 },
				},
				{
					name: "JzCzhz, no alpha",
					args: "jzczhz(0.1 30% 45)",
					expect: { spaceId: "jzczhz", coords: [0.1, 0.078, 45], alpha: 1 },
				},
				{
					name: "JzCzhz, with alpha",
					args: "jzczhz(10% 30% 45 / 0.6)",
					expect: { spaceId: "jzczhz", coords: [0.1, 0.078, 45], alpha: 0.6 },
				},
			],
		},
		{
			name: "ictcp()",
			tests: [
				{
					name: "ictcp(), no alpha",
					args: "ictcp(0.5 0 0.25)",
					expect: { spaceId: "ictcp", coords: [0.5, 0, 0.25], alpha: 1 },
				},
				{
					name: "ictcp(), with alpha",
					args: "ictcp(0.1 -0.1 0.15 / 0.5)",
					expect: { spaceId: "ictcp", coords: [0.1, -0.1, 0.15], alpha: 0.5 },
				},
			],
		},
		{
			name: "hsl()",
			tests: [
				{
					name: "hsl(), commas",
					args: "hsl(180, 50%, 50%)",
					expect: { spaceId: "hsl", coords: [180, 50, 50], alpha: 1 },
				},
				{
					name: "hsl(), negative hue",
					args: "hsl(-180, 50%, 50%)",
					expect: { spaceId: "hsl", coords: [-180, 50, 50], alpha: 1 },
				},
				{
					name: "hsl(), hue > 360",
					args: "hsl(900, 50%, 50%)",
					expect: { spaceId: "hsl", coords: [900, 50, 50], alpha: 1 },
				},
				{
					name: "hsla(), degrees for hue, spaces and slash",
					args: "hsl(90deg 0% 0% / .5)",
					expect: { spaceId: "hsl", coords: [90, 0, 0], alpha: 0.5 },
				},
				{
					name: "hsla(), rad for hue, spaces and slash",
					args: "hsl(1.5707963267948966rad 0% 0% / .5)",
					expect: { spaceId: "hsl", coords: [90, 0, 0], alpha: 0.5 },
				},
				{
					name: "hsla(), grad for hue, spaces and slash",
					args: "hsl(100grad 0% 0% / .5)",
					expect: { spaceId: "hsl", coords: [90, 0, 0], alpha: 0.5 },
				},
				{
					name: "hsla(), turns for hue, spaces and slash",
					args: "hsl(0.25turn 0% 0% / .5)",
					expect: { spaceId: "hsl", coords: [90, 0, 0], alpha: 0.5 },
				},
				{
					name: "hsla(), oog color(rec2020 0 0 1)",
					args: "hsl(230.6 179.7% 37.56% / 1)",
					expect: { spaceId: "hsl", coords: [230.6, 179.7, 37.56], alpha: 1 },
				},
				{
					name: "legacy syntax, <percentage> saturation/lightness, no alpha (#428, #648)",
					args: ["hsl(0, 0%, 0%)"],
					expect: { spaceId: "hsl", coords: [0, 0, 0], alpha: 1 },
				},
				{
					name: "legacy syntax, <percentage> saturation/lightness, alpha (#428, #648)",
					args: ["hsl(0, 0%, 0%, 0.5)"],
					expect: { spaceId: "hsl", coords: [0, 0, 0], alpha: 0.5 },
				},
				{
					name: "legacy syntax, <number> saturation/lightness, no alpha (#428, #648)",
					args: ["hsl(0, 0, 0)"],
					throws: true,
					// TODO: #428. This currently parses successfully but shouldn't because the legacy syntax doesn't allow `<number>` for saturation or lightness.
					skip: true,
				},
				{
					name: "legacy syntax, <number> saturation/lightness, alpha (#428, #648)",
					args: ["hsl(0, 0, 0, 0.5)"],
					throws: true,
					// TODO: #428. This currently parses successfully but shouldn't because the legacy syntax doesn't allow `<number>` for saturation or lightness.
					skip: true,
				},
				{
					name: "modern syntax, <percentage> saturation/lightness, no alpha (#428, #648)",
					args: ["hsl(0 50% 25%)"],
					expect: { spaceId: "hsl", coords: [0, 50, 25], alpha: 1 },
				},
				{
					name: "modern syntax, <percentage> saturation/lightness, alpha (#428, #648)",
					args: ["hsl(0 50% 25% / 50%)"],
					expect: { spaceId: "hsl", coords: [0, 50, 25], alpha: 0.5 },
				},
				{
					name: "modern syntax, <number> saturation/lightness, no alpha (#428, #648)",
					args: ["hsl(0 50 25)"],
					expect: { spaceId: "hsl", coords: [0, 50, 25], alpha: 1 },
				},
				{
					name: "modern syntax, <number> saturation/lightness, alpha (#428, #648)",
					args: ["hsl(0 50 25 / 50%)"],
					expect: { spaceId: "hsl", coords: [0, 50, 25], alpha: 0.5 },
				},
				{
					name: "modern syntax, unit-ful <angle> hue, no alpha (#428, #648)",
					args: ["hsla(240deg 100% 50%)"],
					expect: { spaceId: "hsl", coords: [240, 100, 50], alpha: 1 },
				},
				{
					name: "modern syntax, unit-ful <angle> hue, alpha (#428, #648)",
					args: ["hsla(240deg 100% 50% / 0.5)"],
					expect: { spaceId: "hsl", coords: [240, 100, 50], alpha: 0.5 },
				},
			],
		},
		{
			name: "hwb()",
			tests: [
				{
					args: "hwb(180 20% 30%)",
					expect: { spaceId: "hwb", coords: [180, 20, 30], alpha: 1 },
				},
				{
					args: "hwb(180 20 30)",
					expect: { spaceId: "hwb", coords: [180, 20, 30], alpha: 1 },
				},
			],
		},
		{
			name: "Different number formats",
			tests: [
				{
					args: "color(srgb +0.9 0 0)",
					expect: { spaceId: "srgb", coords: [0.9, 0, 0], alpha: 1 },
				},
				{
					args: "color(srgb .9 0 0)",
					expect: { spaceId: "srgb", coords: [0.9, 0, 0], alpha: 1 },
				},
				{
					args: "color(srgb 9e-1 0 0)",
					expect: { spaceId: "srgb", coords: [0.9, 0, 0], alpha: 1 },
				},
				{
					args: "color(srgb 9E-1 0 0)",
					expect: { spaceId: "srgb", coords: [0.9, 0, 0], alpha: 1 },
				},
				{
					args: "color(srgb 0.09e+1 0 0)",
					expect: { spaceId: "srgb", coords: [0.9, 0, 0], alpha: 1 },
				},
				{
					args: "color(srgb 0.09e1 0 0)",
					expect: { spaceId: "srgb", coords: [0.9, 0, 0], alpha: 1 },
				},
			],
		},
		{
			name: "parsing metadata",
			run: str => {
				let parseMeta = {};
				parse(str, { parseMeta });
				return parseMeta;
			},
			check: check.subset,
			tests: [
				{
					arg: "#ff8000",
					expect: { formatId: "hex" },
				},
			],
		},
	],
};

export default tests;
