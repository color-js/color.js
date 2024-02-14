import Color from "../src/index.js";
import { check } from "./util.mjs";

const tests = {
	name: "Color parse Tests",
	description: "These tests parse different color formats and compare the result as JSON",
	run (color, spaceId = this.data.toSpace) {
		try {
			color = new Color(color);
			return JSON.stringify(color);
		}
		catch (e) {
			return e.name;
		}
	},
	check: (actual, expect) => {
		return actual == expect;
	},
	tests: [
		{
			name: "sRGB colors",
			tests: [
				{
					name: "Color keyword",
					args: "blue",
					expect: '{"spaceId":"srgb","coords":[0,0,1],"alpha":1}'
				},
				{
					name: "Color keyword",
					args: "transparent",
					expect: '{"spaceId":"srgb","coords":[0,0,0],"alpha":0}'
				},
				{
					name: "#rrggbb",
					args: "#ff0066",
					expect: '{"spaceId":"srgb","coords":[1,0,0.4],"alpha":1}'
				},
				{
					name: "#rgb",
					args: "#f06",
					expect: '{"spaceId":"srgb","coords":[1,0,0.4],"alpha":1}'
				},
				{
					name: "#rrggbbaa",
					args: "#ff006688",
					expect: '{"spaceId":"srgb","coords":[1,0,0.4],"alpha":0.5333333333333333}'
				},
				{
					name: "#rgba",
					args: "#f068",
					expect: '{"spaceId":"srgb","coords":[1,0,0.4],"alpha":0.5333333333333333}'
				},
				{
					name: "rgba(% % % / a)",
					args: "rgba(0% 50% 200% / 0.5)",
					expect: '{"spaceId":"srgb","coords":[0,0.5,2],"alpha":0.5}'
				},
				{
					name: "rgb(r g b / a)",
					args: "rgb(0 127.5 300 / .5)",
					expect: '{"spaceId":"srgb","coords":[0,0.5,1.1764705882352942],"alpha":0.5}'
				},
				{
					name: "rgba(n, n, n, a)",
					args: "rgba(0, 127.5, 300, 0.5)",
					expect: '{"spaceId":"srgb","coords":[0,0.5,1.1764705882352942],"alpha":0.5}'
				},
				{
					name: "angles not allowed in rgb()",
					args: "rgb(10deg 10 10)",
					expect: "TypeError"
				}
			]
		},
		{
			name: "Lab and LCH colors",
			tests: [
				{
					args: "lab(100% 0 0)",
					expect: '{"spaceId":"lab","coords":[100,0,0],"alpha":1}'
				},
				{
					name: "case",
					args: "Lab(100% 0 0)",
					expect: '{"spaceId":"lab","coords":[100,0,0],"alpha":1}'
				},
				{
					name: "no percent",
					args: "lab(80 0 0)",
					expect: '{"spaceId":"lab","coords":[80,0,0],"alpha":1}'
				},
				{
					args: "lab(100 -50 50)",
					expect: '{"spaceId":"lab","coords":[100,-50,50],"alpha":1}'
				},
				{
					name: "lab percentage",
					args: "lab(50% 25% -25% / 50%)",
					expect: '{"spaceId":"lab","coords":[50,31.25,-31.25],"alpha":0.5}'
				},
				{
					name: "lab transparency",
					args: "lab(100 -50 5 / .5)",
					expect: '{"spaceId":"lab","coords":[100,-50,5],"alpha":0.5}'
				},
				{
					args: "lch(100% 0 0)",
					expect: '{"spaceId":"lch","coords":[100,0,0],"alpha":1}'
				},
				{
					name: "no percentage",
					args: "lch(100 50 50)",
					expect: '{"spaceId":"lch","coords":[100,50,50],"alpha":1}'
				},
				{
					name: "lch percentage",
					args: "lch(50% 50% 50 / 50%)",
					expect: '{"spaceId":"lch","coords":[50,75,50],"alpha":0.5}'
				},
				{
					name: "Hue over 360",
					args: "lch(100 50 450)",
					expect: '{"spaceId":"lch","coords":[100,50,450],"alpha":1}'
				},
				{
					name: "none hue",
					args: "lch(100 0 none)",
					expect: '{"spaceId":"lch","coords":[100,0,null],"alpha":1}'
				}
			]
		},
		{
			name: "Oklab colors",
			tests: [
				{
					args: "oklab(100% 0 0)",
					expect: '{"spaceId":"oklab","coords":[1,0,0],"alpha":1}'
				},
				{
					name: "alpha",
					args: "oklab(100% 0 0 / 0.5)",
					expect: '{"spaceId":"oklab","coords":[1,0,0],"alpha":0.5}'
				},
				{
					name: "case",
					args: "OKLab(100% 0 0)",
					expect: '{"spaceId":"oklab","coords":[1,0,0],"alpha":1}'
				},
				{
					name: "all percentages",
					args: "oklab(42% 100% -50%)",
					expect: '{"spaceId":"oklab","coords":[0.42,0.4,-0.2],"alpha":1}'
				},
				{
					name: "all numbers",
					args: "oklab(1 -0.20 0.20)",
					expect: '{"spaceId":"oklab","coords":[1,-0.2,0.2],"alpha":1}'
				},
				{
					name: "all numbers out of range",
					args: "oklab(10 -0.80 0.80)",
					expect: '{"spaceId":"oklab","coords":[10,-0.8,0.8],"alpha":1}'
				}
			]
		},
		{
			name: "Oklch colors",
			tests: [
				{
					args: "oklch(100% 0 0)",
					expect: '{"spaceId":"oklch","coords":[1,0,0],"alpha":1}'
				},
				{
					name: "alpha",
					args: "oklch(100% 0 0 / 50%)",
					expect: '{"spaceId":"oklch","coords":[1,0,0],"alpha":0.5}'
				},
				{
					name: "case",
					args: "OKLch(100% 0 0)",
					expect: '{"spaceId":"oklch","coords":[1,0,0],"alpha":1}'
				},
				{
					name: "all numbers",
					args: "oklch(1 0.2 50)",
					expect: '{"spaceId":"oklch","coords":[1,0.2,50],"alpha":1}'
				},
				{
					name: "all numbers out of range",
					args: "oklch(10 2 500 / 10)",
					expect: '{"spaceId":"oklch","coords":[10,2,500],"alpha":1}'
				},
				{
					name: "C as percentage",
					args: "oklch(100% 50% 50)",
					expect: '{"spaceId":"oklch","coords":[1,0.2,50],"alpha":1}'
				},
				{
					name: "C as percentage over 100%",
					args: "oklch(100% 150% 50)",
					expect: '{"spaceId":"oklch","coords":[1,0.6000000000000001,50],"alpha":1}'
				},
				{
					name: "H as degrees",
					args: "oklch(100% 0 30deg)",
					expect: '{"spaceId":"oklch","coords":[1,0,30],"alpha":1}'
				},
				{
					name: "none hue",
					args: "oklch(1 0 none)",
					expect: '{"spaceId":"oklch","coords":[1,0,null],"alpha":1}'
				},
				{
					name: "none alpha",
					args: "oklch(1 0  120 / none)",
					expect: '{"spaceId":"oklch","coords":[1,0,120],"alpha":null}'
				}
			]
		},
		{
			name: "color()",
			tests: [
				{
					args: "color(srgb 0 1 .5)",
					expect: '{"spaceId":"srgb","coords":[0,1,0.5],"alpha":1}'
				},
				{
					args: "color(srgb 0 100% 50%)",
					expect: '{"spaceId":"srgb","coords":[0,1,0.5],"alpha":1}'
				},
				{
					args: "color(srgb-linear 0 1 .5)",
					expect: '{"spaceId":"srgb-linear","coords":[0,1,0.5],"alpha":1}'
				},
				{
					args: "color(srgb-linear 0 100% 50%)",
					expect: '{"spaceId":"srgb-linear","coords":[0,1,0.5],"alpha":1}'
				},
				{
					args: "color(display-p3 0 1 .5)",
					expect: '{"spaceId":"p3","coords":[0,1,0.5],"alpha":1}'
				},
				{
					args: "color(display-p3 0% 100% 50%)",
					expect: '{"spaceId":"p3","coords":[0,1,0.5],"alpha":1}'
				},
				{
					args: "color(display-p3-linear 0 1 .5)",
					expect: '{"spaceId":"p3-linear","coords":[0,1,0.5],"alpha":1}'
				},
				{
					args: "color(--display-p3-linear 0% 100% 50%)",
					expect: '{"spaceId":"p3-linear","coords":[0,1,0.5],"alpha":1}'
				},
				{
					args: "color(rec2020 0 1 .5)",
					expect: '{"spaceId":"rec2020","coords":[0,1,0.5],"alpha":1}'
				},
				{
					args: "color(rec2020 0 100% 50%)",
					expect: '{"spaceId":"rec2020","coords":[0,1,0.5],"alpha":1}'
				},
				{
					args: "color(rec2020-linear 0 1 .5)",
					expect: '{"spaceId":"rec2020-linear","coords":[0,1,0.5],"alpha":1}'
				},
				{
					args: "color(--rec2020-linear 0 100% 50%)",
					expect: '{"spaceId":"rec2020-linear","coords":[0,1,0.5],"alpha":1}'
				},
				{
					args: "color(--rec2100-hlg 0 100% 50%)",
					expect: '{"spaceId":"rec2100hlg","coords":[0,1,0.5],"alpha":1}'
				},
				{
					args: "color(--rec2100-pq 0 100% 50%)",
					expect: '{"spaceId":"rec2100pq","coords":[0,1,0.5],"alpha":1}'
				},
				{
					args: "color(a98-rgb 0 1 .5)",
					expect: '{"spaceId":"a98rgb","coords":[0,1,0.5],"alpha":1}'
				},
				{
					args: "color(a98-rgb 0 100% 50%)",
					expect: '{"spaceId":"a98rgb","coords":[0,1,0.5],"alpha":1}'
				},
				{
					args: "color(a98-rgb-linear 0 1 .5)",
					expect: '{"spaceId":"a98rgb-linear","coords":[0,1,0.5],"alpha":1}'
				},
				{
					args: "color(--a98-rgb-linear 0 100% 50%)",
					expect: '{"spaceId":"a98rgb-linear","coords":[0,1,0.5],"alpha":1}'
				},
				{
					args: "color(prophoto-rgb 0 1 .5)",
					expect: '{"spaceId":"prophoto","coords":[0,1,0.5],"alpha":1}'
				},
				{
					args: "color(prophoto-rgb 0 100% 50%)",
					expect: '{"spaceId":"prophoto","coords":[0,1,0.5],"alpha":1}'
				},
				{
					args: "color(prophoto-rgb-linear 0 1 .5)",
					expect: '{"spaceId":"prophoto-linear","coords":[0,1,0.5],"alpha":1}'
				},
				{
					args: "color(--prophoto-rgb-linear 0 100% 50%)",
					expect: '{"spaceId":"prophoto-linear","coords":[0,1,0.5],"alpha":1}'
				},
				{
					args: "color(acescc 0 1 .5)",
					expect: '{"spaceId":"acescc","coords":[0,1,0.5],"alpha":1}'
				},
				{
					args: "color(--acescc 0 100% 50%)",
					expect: '{"spaceId":"acescc","coords":[0,1,0.5],"alpha":1}'
				},
				{
					args: "color(acescg 0 1 .5)",
					expect: '{"spaceId":"acescg","coords":[0,1,0.5],"alpha":1}'
				},
				{
					args: "color(--acescg 0 100% 50%)",
					expect: '{"spaceId":"acescg","coords":[0,1,0.5],"alpha":1}'
				},
				{
					args: "color(xyz 0 1 .5)",
					expect: '{"spaceId":"xyz-d65","coords":[0,1,0.5],"alpha":1}'
				},
				{
					args: "color(xyz 0 100% 50%)",
					expect: '{"spaceId":"xyz-d65","coords":[0,1,0.5],"alpha":1}'
				},
				{
					args: "color(xyz-d65 0 1 .5)",
					expect: '{"spaceId":"xyz-d65","coords":[0,1,0.5],"alpha":1}'
				},
				{
					args: "color(xyz-d65 0 100% 50%)",
					expect: '{"spaceId":"xyz-d65","coords":[0,1,0.5],"alpha":1}'
				},
				{
					args: "color(xyz-d50 0 1 .5)",
					expect: '{"spaceId":"xyz-d50","coords":[0,1,0.5],"alpha":1}'
				},
				{
					args: "color(xyz-d50 0 100% 50%)",
					expect: '{"spaceId":"xyz-d50","coords":[0,1,0.5],"alpha":1}'
				},
				{
					args: "color(--xyz-abs-d65 0 100% 50%)",
					expect: '{"spaceId":"xyz-abs-d65","coords":[0,1,0.5],"alpha":1}'
				},
				{
					args: "color(jzazbz 0 25% -50%)",
					expect: '{"spaceId":"jzazbz","coords":[0,0.125,-0.25],"alpha":1}'
				},
				{
					args: "color(--jzazbz 0 25% -50%)",
					expect: '{"spaceId":"jzazbz","coords":[0,0.125,-0.25],"alpha":1}'
				},
				{
					args: "color(jzczhz 0 0.5 75%)",
					expect: '{"spaceId":"jzczhz","coords":[0,0.5,0.75],"alpha":1}'
				},
				{
					args: "color(--jzczhz 0 0.5 75%)",
					expect: '{"spaceId":"jzczhz","coords":[0,0.5,0.75],"alpha":1}'
				},
				{
					args: "color(--hct 0.25turn 50% 25)",
					expect: '{"spaceId":"hct","coords":[90,72.5,25],"alpha":1}'
				},
				{
					args: "color(--hsv 25deg 50% 75)",
					expect: '{"spaceId":"hsv","coords":[25,50,75],"alpha":1}'
				},
				{
					args: "color(--cam16-jmh 25 50 75)",
					expect: '{"spaceId":"cam16-jmh","coords":[25,50,75],"alpha":1}'
				},
				{
					args: "color(--hpluv 25deg 50% 75)",
					expect: '{"spaceId":"hpluv","coords":[25,50,75],"alpha":1}'
				},
				{
					args: "color(--hsluv 25deg 50% 75)",
					expect: '{"spaceId":"hsluv","coords":[25,50,75],"alpha":1}'
				},
				{
					args: "color(--ictcp 0.5 0 0.25)",
					expect: '{"spaceId":"ictcp","coords":[0.5,0,0.25],"alpha":1}'
				},
				{
					args: "color(--lchuv 50% 0 25deg)",
					expect: '{"spaceId":"lchuv","coords":[50,0,25],"alpha":1}'
				},
				{
					args: "color(--luv 50% 1 -1)",
					expect: '{"spaceId":"luv","coords":[50,1,-1],"alpha":1}'
				},
				{
					name: "With transparency",
					args: "color(display-p3 0 1 0 / .5)",
					expect: '{"spaceId":"p3","coords":[0,1,0],"alpha":0.5}'
				},
				{
					name: "No arguments",
					args: "color(display-p3)",
					expect: '{"spaceId":"p3","coords":[0,0,0],"alpha":1}'
				},
				{
					name: "No arguments / alpha",
					args: "color(display-p3 / .5)",
					expect: '{"spaceId":"p3","coords":[0,0,0],"alpha":0.5}'
				},
				{
					name: "Fewer arguments",
					args: "color(display-p3 1)",
					expect: '{"spaceId":"p3","coords":[1,0,0],"alpha":1}'
				},
				{
					name: "Fewer arguments / alpha",
					args: "color(display-p3 1 / .5)",
					expect: '{"spaceId":"p3","coords":[1,0,0],"alpha":0.5}'
				},
				{
					name: "none red",
					args: "color(display-p3 none 1 .5)",
					expect: '{"spaceId":"p3","coords":[null,1,0.5],"alpha":1}'
				}
			]
		},
		{
			name: "hsl()",
			tests: [
				{
					name: "hsl(), commas",
					args: "hsl(180, 50%, 50%)",
					expect: '{"spaceId":"hsl","coords":[180,50,50],"alpha":1}'
				},
				{
					name: "hsl(), negative hue",
					args: "hsl(-180, 50%, 50%)",
					expect: '{"spaceId":"hsl","coords":[-180,50,50],"alpha":1}'
				},
				{
					name: "hsl(), hue > 360",
					args: "hsl(900, 50%, 50%)",
					expect: '{"spaceId":"hsl","coords":[900,50,50],"alpha":1}'
				},
				{
					name: "hsla(), degrees for hue, spaces and slash",
					args: "hsl(90deg 0% 0% / .5)",
					expect: '{"spaceId":"hsl","coords":[90,0,0],"alpha":0.5}'
				},
				{
					name: "hsla(), rad for hue, spaces and slash",
					args: "hsl(1.5707963267948966rad 0% 0% / .5)",
					expect: '{"spaceId":"hsl","coords":[90,0,0],"alpha":0.5}'
				},
				{
					name: "hsla(), grad for hue, spaces and slash",
					args: "hsl(100grad 0% 0% / .5)",
					expect: '{"spaceId":"hsl","coords":[90,0,0],"alpha":0.5}'
				},
				{
					name: "hsla(), turns for hue, spaces and slash",
					args: "hsl(0.25turn 0% 0% / .5)",
					expect: '{"spaceId":"hsl","coords":[90,0,0],"alpha":0.5}'
				},
				{
					name: "hsla(), none hue, spaces and slash",
					args: "hsl(none 0% 0% / .5)",
					expect: '{"spaceId":"hsl","coords":[null,0,0],"alpha":0.5}'
				},
				{
					name: "hsla(), oog color(rec2020 0 0 1)",
					args: "hsl(230.6 179.7% 37.56% / 1)",
					expect: '{"spaceId":"hsl","coords":[230.6,179.7,37.56],"alpha":1}'
				},
				{
					name: "hsl(), none hue ",
					args: "hsl(none, 50%, 50%)",
					expect: '{"spaceId":"hsl","coords":[null,50,50],"alpha":1}'
				}
			]
		},
		{
			name: "hwb()",
			tests: [
				{
					args: "hwb(180 20% 30%)",
					expect: '{"spaceId":"hwb","coords":[180,20,30],"alpha":1}'
				},
				{
					name: "none hue",
					args: "hwb(none 20% 30%)",
					expect: '{"spaceId":"hwb","coords":[null,20,30],"alpha":1}'
				}
			]
		}
	]
};

export default tests;
