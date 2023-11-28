import Color from "../src/index.js";
import { check } from "./util.mjs";

const tests = {
	name: "Color conversion Tests",
	description: "These tests parse different color formats and then print out the coordinates in various color spaces.",
	run (color, spaceId = this.data.toSpace) {
		color = new Color(color);
		return color.to(spaceId).coords;
	},
	check: check.deep(function (actual, expect) {
		if (expect === null || Number.isNaN(expect)) {
			// Treat NaN and null as equivalent for now
			return actual === null || Number.isNaN(actual);
		}

		let checkProximity = check.proximity({epsilon: this.data.epsilon});
		return checkProximity(actual, expect);
	}),
	data: {
		epsilon: .0001
	},
	tests: [
		{
			name: "sRGB to LCH",
			data: {
				toSpace: "lch"
			},
			tests: [
				{
					args: "slategray",
					expect: [52.69734985816035, 11.234156441150068, 253.00263766910288]
				},
				{
					args: "papayawhip",
					expect: [95.22890204788412, 14.894161408435306, 80.18569512775224]
				},
				{
					args: "white",
					expect: [100, 0, NaN]
				},
				{
					args: "black",
					expect: [0, 0, NaN]
				}
			]
		},
		{
			name: "sRGB to (D65) XYZ",
			data: {
				toSpace: "xyz-d65",
			},
			tests: [
				{
					args: "white",
					expect: [0.9504559270516717, 1, 1.0890577507598784]
				},
			]
		},
		{
			name: "HWB to sRGB",
			data: {
				toSpace: "srgb",
			},
			tests: [
				{
					args: "hwb(0 20% 40%)",
					expect: [0.6, 0.2, 0.2]
				},
				{
					args: "hwb(90 30% 5%)",
					expect: [0.625, 0.950, 0.300]
				},
				{
					args: "hwb(30 0% 80%)",
					expect: [0.2, 0.1, 0]
				},
				{
					args: "hwb(720 20% 40%)",
					expect: [0.6, 0.2, 0.2]
				},
				{
					args: "hwb(-270 30% 5%)",
					expect: [0.625, 0.950, 0.300]
				},
				{
					args: "hwb(0 40% 80%)",
					expect: [0.3333333, 0.3333333, 0.3333333]
				},
				{
					args: "hwb(0 50% 50%)",
					expect: [0.5, 0.5, 0.5]
				},
			]
		},
		{
			name: "sRGB to HWB",
			data: {
				toSpace: "hwb",
			},
			tests: [
				{
					args: "rgb(60% 20% 20%)",
					expect: [0, 20, 40]
				},
				{
					args: "black",
					expect: [NaN, 0, 100]
				},
				{
					args: "white",
					expect: [NaN, 100, 0]
				}
			]
		},
		{
			name: "Out of sRGB gamut conversions",
			tests: [
				{
					args: ["color(rec2020 0 0 1)", "hwb"],
					expect: [230.63914728691736, -29.9212950204808, -5.0489461007690295]
				},
				{
					args: ["color(rec2020 0 0 1)", "hsl"],
					expect: [230.63914728691736, 179.65454686851365, 37.563825540144116]
				},
				{
					args: ["color(rec2020 0 0 1)", "hsv"],
					expect: [230.63914728691736, 128.48319391208224, 105.04894610076903]
				}
			]
		},
		{
			name: "sRGB to HSL",
			data: {
				toSpace: "hsl",
			},
			tests: [
				{
					args: "black",
					expect: [NaN, 0, 0]
				},
				{
					args: "white",
					expect: [NaN, 0, 100]
				}
			]
		},
		{
			name: "P3 to sRGB",
			data: {
				toSpace: "srgb",
			},
			tests: [
				{
					args: "color(display-p3 0.47 0.47 0.47)",
					expect: [0.47, 0.47, 0.47]
				},
				{
					args: "color(display-p3 1 1 1)",
					expect: [1, 1, 1]
				},
				{
					args: "color(display-p3 -0.1 -0.1 -0.1)",
					expect: [-0.1, -0.1, -0.1]
				},
				{
					args: "color(display-p3 0.238 0.532 0.611)",
					expect: [0.019595, 0.54027, 0.621351]
				},
				{
					args: "color(display-p3 1 0 0)",
					expect: [1.09299, -0.226745, -0.150155]
				},
				{
					args: "color(display-p3 0 1 0)",
					expect: [-0.511567, 1.018276, -0.310711]
				},
				{
					args: "color(display-p3 0 0 1)",
					expect: [0, 0, 1.0420216193529395]
				}
			]
		},
		{
			name: "rec2100pq to XYZ and back",
			data: {
				toSpace: "rec2100pq",
			},
			tests: [
				{
					args: ["color(rec2100-pq 0.3720 0.3720 0.3720)", "xyz-d65"],
					expect: [0.11118, 0.11698, 0.12740]
				},
				{
					args: "color(xyz 0.11118, 0.11698, 0.12740)",
					expect: [0.3720, 0.3720, 0.3720]
				},
				{
					args: "white",
					expect: [0.5807, 0.5807, 0.5807]
				},
				{
					args: "color(display-p3 1 0 0)",
					expect: [0.5514, 0.2939, 0]
				},
				{
					args: "color(display-p3 0 1 0)",
					expect: [0.4200, 0.5744, 0.2248]
				},
				{
					args: "color(display-p3 0 0 1)",
					expect: [0.2970, 0.2026, 0.5790]
				},
				{
					args: "color(rec2020 1 0 0)",
					expect: [0.5807, 0, 0]
				},
				{
					args: "color(rec2020 0 1 0)",
					expect: [0, 0.5807, 0]
				},
				{
					args: "color(rec2020 0 0 1)",
					expect: [0, 0, 0.5807]
				}
			]
		},
		{
			name: "Jzazbz",
			description: "Conversions to Absolute D65 XYZ tested against published Matlab code.",
			data: {
				toSpace: "jzazbz",
			},
			tests: [
				{
					args: ["color(jzazbz 0.5 0 0)", "xyz-d65"],
					expect: [8.103011, 8.39796, 6.924744]
				},
				{
					args: ["color(jzazbz 1 0 0)", "xyz-d65"],
					expect: [48.887976, 50.667498, 41.779127]
				},
				{
					args: ["color(jzazbz 0.1 -0.05 0.05)", "xyz-d65"],
					expect: [0.108518, 0.172874, 0.074937]
				},
				{
					args: "color(xyz 0 0 0)",
					expect: [0.0, 0.0, 0.0]
				},
				{
					args: "white",
					expect: [0.222065, -0.0002, -0.0001]
				},
				{
					args: "color(rec2020 1 1 1)",
					expect: [0.22206525, -0.000161, -0.000117]
				},
				{
					args: "color(jzazbz 0.22206525 -0.000161 -0.000117)",
					expect: [1, 1, 1]
				},
				{
					args: "#FFFF80",
					expect: [0.212398, -0.0171, 0.0914]
				},
				{
					args: "color(rec2020 1 0 0)",
					expect: [0.154543, 0.1643, 0.1351]
				},
				{
					args: "color(rec2020 0 1 0)",
					expect: [0.160578, -0.2066, 0.1462]
				},
				{
					args: "color(rec2020 0 0 1)",
					expect: [0.091785, -0.0775, -0.2047]
				}
			]
		},
		{
			name: "JzCzHz",
			data: {
				toSpace: "jzczhz",
			},
			tests: [
				{
					args: "color(jzazbz 0.5 0 0)",
					expect: [0.5, 0, NaN]
				},
				{
					args: "color(jzazbz 0.2 0.000004 -0.000003)",
					expect: [0.2, 0.000005, NaN]
				},
				{
					args: "color(jzazbz 0.2 0.000005 -0.000005)",
					expect: [0.2, 0.00000707, NaN]
				},
				{
					args: "color(jzazbz 0.1 -0.05 0.05)",
					expect: [0.1, 0.070710678, 135]
				},
				{
					args: "color(jzczhz 0.1 0.070710678 135)",
					expect: [0.1, -0.05, 0.05]
				},
				{
					args: "color(jzazbz 0.1 0.1 -0.08)",
					expect: [0.1, 0.12806248, 321.34019]
				},
				{
					args: "color(jzczhz 0.1, 0.12806248, 321.34019)",
					expect: [0.1, 0.1, -0.08]
				}
			]
		},
		{
			name: "ICtCp",
			data: {
				toSpace: "ictcp",
			},
			tests: [
				{
					name: "XYZ to ICtCp",
					args: "color(xyz 0 0 0)",
					expect: [0.0, 0.0, 0.0]
				},
				{
					name: "XYZ of D50 to ICtCp",
					args: "color(xyz 0.96422, 1.00000, 0.82521)",
					expect: [0.5820, 0.0344, 0.0001]
				},
				{
					name: "sRGB white (D65) to ICtCp",
					args: "white",
					expect: [0.5820, 0.0344, 0.0001]
				},
				{
					name: "rec2020 white to ICtCp",
					args: "color(rec2020 1 1 1)",
					expect: [0.5820, 0.0344, 0.0001]
				},
				{
					name: "rec2020 red to ICtCp",
					args: "color(rec2020 1 0 0)",
					expect: [0.4413, -0.1164, 0.3985]
				},
				{
					name: "rec2020 green to ICtCp",
					args: "color(rec2020 0 1 0)",
					expect: [0.5305, -0.4247, -0.1219]
				},
				{
					name: "rec2020 blue to ICtCp",
					args: "color(rec2020 0 0 1)",
					expect: [0.3687,  0.2746,  -0.2406]
				},
				{
					name: "ICtCp rec2020 red back to rec2020",
					args: ["color(ictcp 0.4413 -0.1164 0.3985)", "rec2020"],
					expect: [1, 0, 0]
				},
				{
					name: "ICtCp rec2020 green back to rec2020",
					args: ["color(ictcp 0.5305 -0.4247 -0.1219)", "rec2020"],
					expect: [0, 1, 0]
				},
				{
					name: "ICtCp rec2020 blue back to rec2020",
					args: ["color(ictcp 0.3687  0.2746  -0.2406)", "rec2020"],
					expect: [0, 0, 1]
				}
			]
		},
		{
			name: "OKLab",
			description: "Conversions tested against results from published linear sRGB to OKLab C++ code (using better matrices, updated 2021-01-2)",
			data: {
				toSpace: "oklab",
			},
			tests: [
				{
					name: "sRGB white (D65) to OKlab",
					args: "white",
					expect: [1.000000, 0.000000, 0.000000]
				},
				{
					name: "sRGB red (D65) to OKlab",
					args: "red",
					expect: [0.627955, 0.224863, 0.125846]
				},
				{
					name: "sRGB lime (D65) to OKlab",
					args: "lime",
					expect: [0.86644, -0.233888, 0.179498]
				},
				{
					name: "sRGB blue (D65) to OKlab",
					args: "blue",
					expect: [0.452014, -0.032457, -0.311528]
				},
				{
					name: "sRGB cyan (D65) to OKlab",
					args: "cyan",
					expect: [0.905399, -0.149444, -0.039398]
				},
				{
					name: "sRGB magenta (D65) to OKlab",
					args: "magenta",
					expect: [0.701674, 0.274566, -0.169156]
				},
				{
					name: "sRGB yellow (D65) to OKlab",
					args: "yellow",
					expect: [0.967983, -0.071369, 0.198570]
				},
				{
					name: "sRGB black (D65) to OKlab",
					args: "black",
					expect: [0.000000, 0.000000, 0.000000]
				}
			]
		},
		{
			name: "OKLCh",
			data: {
				toSpace: "oklch",
			},
			tests: [
				{
					name: "sRGB white (D65) to OKlch",
					args: "white",
					expect: [1.0, 0.0, NaN]
				},
				{
					name: "sRGB red (D65) to OKlab",
					args: "red",
					expect: [0.6279553639214311, 0.2576833038053608, 29.23388027962784]
				},
				{
					name: "sRGB lime (D65) to OKlab",
					args: "lime",
					expect: [0.8664396175234368, 0.2948272245426958, 142.4953450414439]
				},
				{
					name: "sRGB blue (D65) to OKlab",
					args: "blue",
					expect: [0.45201371817442365, 0.3132143886344849, 264.0520226163699]
				}
			]
		},
		{
			name: "Linear-light sRGB",
			data: {
				toSpace: "srgb-linear",
			},
			tests: [
				{
					name: "sRGB white to linear (identity",
					args: "white",
					expect: [1.0, 1.0, 1.0]
				},
				{
					name: "mid grey to linear",
					args: "rgb(50% 50% 50%)",
					expect: [0.21404114, 0.21404114, 0.21404114]
				}
			]
		},
		{
			name: "ACEScc to XYZ",
			data: {
				toSpace: "xyz-d65",
			},
			tests: [
				{
					name: "ACEScc media white to XYZ",
					args: "color(acescc 1.0 1.0 1.0)",
					expect: [211.8195, 222.8610, 242.7084]
				},
				{
					name: "mid grey (linear 0.5) to XYZ",
					args: "color(acescc 0.4977169 0.4977169 0.4977169)",
					expect: [0.475228, 0.500000, 0.544529]
				},
				{
					name: "media black to XYZ",
					args: "color(acescc 0 0 0)",
					expect: [0.001127, 0.001186, 0.001291]
				},
				{
					name: "deepest black to XYZ",
					args: "color(acescc -0.358447, -0.358447, -0.358447)",
					expect: [0, 0, 0]
				},
				{
					name: "ACEScc red to XYZ",
					args: "color(acescc 1.0 0.0 0.0)",
					expect: [145.3586, 59.6545, -1.1981]
				},
				{
					name: "ACEScc green to XYZ",
					args: "color(acescc 0.0 1.0 0.0)",
					expect: [28.5798, 150.2844, 0.306392]
				},
				{
					name: "ACEScc blue to XYZ",
					args: "color(acescc 0.0 0.0 1.0)",
					expect: [37.8833, 12.9243, 243.6027]
				}
			]
		},
		{
			name: "ACEScc to Display P3",
			data: {
				toSpace: "p3",
			},
			tests: [
				{
					name: "ACEScc red to P3",
					args: "color(acescc 1.0 0.0 0.0)",
					expect: [11.42071, -3.24602, -0.722011]
				},
				{
					name: "ACEScc green to P3",
					args: "color(acescc 0.0 1.0 0.0)",
					expect: [-6.096756, 10.318155, -2.713562]
				},
				{
					name: "ACEScc blue to P3",
					args: "color(acescc 0.0 0.0 1.0)",
					expect: [-3.266071, -1.586111, 10.178351]
				}
			]
		},
		{
			name: "Get coordinates",
			data: {
				slategray: new Color("slategray"),
			},
			tests: [
				{
					name: "color.c",
					run () {
						return this.data.slategray.c;
					},
					expect: 11.23415
				},

				{
					name: "color.lch[1]",
					run () {
						return this.data.slategray.lch[1];
					},
					expect: 11.23415
				},
				{
					name: "color.lch.c",
					run () {
						return this.data.slategray.lch.c;
					},
					expect: 11.23415
				},
				{
					name: "color.oklch.c",
					run () {
						return this.data.slategray.oklch.c;
					},
					expect: 0.03100055
				},
				{
					name: "color.jzazbz.Jz",
					run () {
						return this.data.slategray.jzazbz.jz;
					},
					expect: 0.11646942
				},
				{
					name: "color.jzazbz.Jz",
					run () {
						var color = new Color("color(jzazbz 0.54 0 0)");
						return color.jzazbz.jz;
					},
					expect: 0.54
				}
			]
		}
	]
};

export default tests;
