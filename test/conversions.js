import Color from "../src/index.js";
import * as check from "../node_modules/htest.dev/src/check.js";

const tests = {
	name: "Color conversion Tests",
	description:
		"These tests parse different color formats and then print out the coordinates in various color spaces.",
	run (color, spaceId = this.data.toSpace) {
		color = new Color(color);
		return color.to(spaceId).coords;
	},
	check: check.deep(function (actual, expect) {
		let checkProximity = check.shallowEquals({ epsilon: this.data.epsilon, subset: true });
		let ret = checkProximity(actual, expect);
		return ret;
	}),
	data: {
		epsilon: 0.0001,
	},
	tests: [
		{
			name: "sRGB to LCH",
			data: {
				toSpace: "lch",
			},
			tests: [
				{
					args: "slategray",
					expect: [52.69734985816035, 11.234156441150068, 253.00263766910288],
				},
				{
					args: "papayawhip",
					expect: [95.22890204788412, 14.894161408435306, 80.18569512775224],
				},
				{
					args: "white",
					expect: [100, 0, null],
				},
				{
					args: "gray",
					expect: [, 0, null],
				},
				{
					args: "darkgray",
					expect: [, 0, null],
				},
				{
					args: "black",
					expect: [0, 0, null],
				},
			],
		},
		{
			name: "sRGB to (D65) XYZ",
			data: {
				toSpace: "xyz-d65",
			},
			tests: [
				{
					args: "white",
					expect: [0.9504559270516717, 1, 1.0890577507598784],
				},
			],
		},
		{
			name: "HWB to sRGB",
			data: {
				toSpace: "srgb",
			},
			tests: [
				{
					args: "hwb(0 20% 40%)",
					expect: [0.6, 0.2, 0.2],
				},
				{
					args: "hwb(90 30% 5%)",
					expect: [0.625, 0.95, 0.3],
				},
				{
					args: "hwb(30 0% 80%)",
					expect: [0.2, 0.1, 0],
				},
				{
					args: "hwb(720 20% 40%)",
					expect: [0.6, 0.2, 0.2],
				},
				{
					args: "hwb(-270 30% 5%)",
					expect: [0.625, 0.95, 0.3],
				},
				{
					args: "hwb(0 40% 80%)",
					expect: [0.3333333, 0.3333333, 0.3333333],
				},
				{
					args: "hwb(0 50% 50%)",
					expect: [0.5, 0.5, 0.5],
				},
			],
		},
		{
			name: "sRGB to HWB",
			data: {
				toSpace: "hwb",
			},
			tests: [
				{
					args: "rgb(60% 20% 20%)",
					expect: [0, 20, 40],
				},
				{
					args: "black",
					expect: [null, 0, 100],
				},
				{
					args: "white",
					expect: [null, 100, 0],
				},
			],
		},
		{
			name: "Out of sRGB gamut conversions",
			tests: [
				{
					args: ["color(rec2020 0 0 1)", "hwb"],
					expect: [230.63914728691736, -29.9212950204808, -5.0489461007690295],
				},
				{
					args: ["color(rec2020 0 0 1)", "hsl"],
					expect: [230.63914728691736, 179.65454686851365, 37.563825540144116],
				},
				{
					args: ["color(rec2020 0 0 1)", "hsv"],
					expect: [230.63914728691736, 128.48319391208224, 105.04894610076903],
				},
			],
		},
		{
			name: "sRGB to HSL",
			data: {
				toSpace: "hsl",
			},
			tests: [
				{
					args: "black",
					expect: [null, 0, 0],
				},
				{
					args: "white",
					expect: [null, 0, 100],
				},
			],
		},
		{
			name: "P3 to sRGB",
			data: {
				toSpace: "srgb",
			},
			tests: [
				{
					args: "color(display-p3 0.47 0.47 0.47)",
					expect: [0.47, 0.47, 0.47],
				},
				{
					args: "color(display-p3 1 1 1)",
					expect: [1, 1, 1],
				},
				{
					args: "color(display-p3 -0.1 -0.1 -0.1)",
					expect: [-0.1, -0.1, -0.1],
				},
				{
					args: "color(display-p3 0.238 0.532 0.611)",
					expect: [0.019595, 0.54027, 0.621351],
				},
				{
					args: "color(display-p3 1 0 0)",
					expect: [1.09299, -0.226745, -0.150155],
				},
				{
					args: "color(display-p3 0 1 0)",
					expect: [-0.511567, 1.018276, -0.310711],
				},
				{
					args: "color(display-p3 0 0 1)",
					expect: [0, 0, 1.0420216193529395],
				},
			],
		},
		{
			name: "rec2100pq to XYZ and back",
			data: {
				toSpace: "rec2100pq",
			},
			tests: [
				{
					args: ["color(rec2100-pq 0.3720 0.3720 0.3720)", "xyz-d65"],
					expect: [0.11118, 0.11698, 0.1274],
				},
				{
					args: "color(xyz 0.11118, 0.11698, 0.12740)",
					expect: [0.372, 0.372, 0.372],
				},
				{
					args: "white",
					expect: [0.5807, 0.5807, 0.5807],
				},
				{
					args: "color(display-p3 1 0 0)",
					expect: [0.5514, 0.2939, 0],
				},
				{
					args: "color(display-p3 0 1 0)",
					expect: [0.42, 0.5744, 0.2248],
				},
				{
					args: "color(display-p3 0 0 1)",
					expect: [0.297, 0.2026, 0.579],
				},
				{
					args: "color(rec2020 1 0 0)",
					expect: [0.5807, 0, 0],
				},
				{
					args: "color(rec2020 0 1 0)",
					expect: [0, 0.5807, 0],
				},
				{
					args: "color(rec2020 0 0 1)",
					expect: [0, 0, 0.5807],
				},
			],
		},
		{
			name: "Jzazbz",
			description: "Conversions to Absolute D65 XYZ tested against published Matlab code.",
			data: {
				toSpace: "jzazbz",
			},
			tests: [
				{
					args: ["jzazbz(0.5 0 0)", "xyz-d65"],
					expect: [7.986957, 8.397692, 9.136922],
				},
				{
					args: ["jzazbz(1 0 0)", "xyz-d65"],
					expect: [48.187785, 50.665878, 55.125885],
				},
				{
					args: ["jzazbz(0.1 -0.05 0.05)", "xyz-d65"],
					expect: [0.108518, 0.172874, 0.074937],
				},
				{
					args: "color(xyz 0 0 0)",
					expect: [0.0, 0.0, 0.0],
				},
				{
					args: "white",
					expect: [0.222065, -0.0002, -0.0001],
				},
				{
					args: "color(rec2020 1 1 1)",
					expect: [0.22206525, -0.000161, -0.000117],
				},
				{
					args: ["jzazbz(0.22206525 -0.000161 -0.000117)", "srgb"],
					expect: [1, 1, 1],
				},
				{
					args: "#FFFF80",
					expect: [0.212398, -0.0171, 0.0914],
				},
				{
					args: "color(rec2020 1 0 0)",
					expect: [0.154543, 0.1643, 0.1351],
				},
				{
					args: "color(rec2020 0 1 0)",
					expect: [0.160578, -0.2066, 0.1462],
				},
				{
					args: "color(rec2020 0 0 1)",
					expect: [0.091785, -0.0775, -0.2047],
				},
			],
		},
		{
			name: "JzCzHz",
			data: {
				toSpace: "jzczhz",
			},
			tests: [
				{
					args: "jzazbz(0.5 0 0)",
					expect: [0.5, 0, null],
				},
				{
					args: "jzazbz(0.1 -0.05 0.05)",
					expect: [0.1, 0.070710678, 135],
				},
				{
					args: ["jzczhz(0.1 0.070710678 135)", "jzazbz"],
					expect: [0.1, -0.05, 0.05],
				},
				{
					args: "jzazbz(0.1 0.1 -0.08)",
					expect: [0.1, 0.12806248, 321.34019],
				},
				{
					args: ["jzczhz(0.1, 0.12806248, 321.34019)", "jzazbz"],
					expect: [0.1, 0.1, -0.08],
				},
			],
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
					expect: [0.0, 0.0, 0.0],
				},
				{
					name: "XYZ of D50 to ICtCp",
					args: "color(xyz-d50 0.96422, 1.00000, 0.82521)",
					expect: [0.5806890049863622, 0.00000696242, -0.00002569716],
				},
				{
					name: "sRGB white (D65) to ICtCp",
					args: "white",
					expect: [0.5806890049863622, 0.00000696242, -0.00002569716],
				},
				{
					name: "rec2020 white to ICtCp",
					args: "color(rec2020 1 1 1)",
					expect: [0.5806890049863622, 0.00000696242, -0.00002569716],
				},
				{
					name: "rec2020 red to ICtCp",
					args: "color(rec2020 1 0 0)",
					expect: [0.44707334125327025, -0.12956985056013226, 0.3992012669381549],
				},
				{
					name: "rec2020 green to ICtCp",
					args: "color(rec2020 0 1 0)",
					expect: [0.5304887192571797, -0.41543423180389427, -0.1138035187565125],
				},
				{
					name: "rec2020 blue to ICtCp",
					args: "color(rec2020 0 0 1)",
					expect: [0.3447364812349795, 0.26592861954236724, -0.23729937427859088],
				},
				{
					name: "ICtCp rec2020 red back to rec2020",
					args: [
						"ictcp(0.44707334125327025 -0.12956985056013226 0.3992012669381549)",
						"rec2020",
					],
					expect: [1, 0, 0],
				},
				{
					name: "ICtCp rec2020 green back to rec2020",
					args: [
						"ictcp(0.5304887192571797 -0.41543423180389427 -0.1138035187565125)",
						"rec2020",
					],
					expect: [0, 1, 0],
				},
				{
					name: "ICtCp rec2020 blue back to rec2020",
					args: [
						"ictcp(0.3447364812349795 0.26592861954236724 -0.23729937427859088)",
						"rec2020",
					],
					expect: [0, 0, 1],
				},
			],
		},
		{
			name: "OKLab",
			description:
				"Conversions tested against results from published linear sRGB to OKLab C++ code (using better matrices, updated 2021-01-2)",
			data: {
				toSpace: "oklab",
			},
			tests: [
				{
					name: "sRGB white (D65) to OKlab",
					args: "white",
					expect: [1.0, 0.0, 0.0],
				},
				{
					name: "sRGB red (D65) to OKlab",
					args: "red",
					expect: [0.627955, 0.224863, 0.125846],
				},
				{
					name: "sRGB lime (D65) to OKlab",
					args: "lime",
					expect: [0.86644, -0.233888, 0.179498],
				},
				{
					name: "sRGB blue (D65) to OKlab",
					args: "blue",
					expect: [0.452014, -0.032457, -0.311528],
				},
				{
					name: "sRGB cyan (D65) to OKlab",
					args: "cyan",
					expect: [0.905399, -0.149444, -0.039398],
				},
				{
					name: "sRGB magenta (D65) to OKlab",
					args: "magenta",
					expect: [0.701674, 0.274566, -0.169156],
				},
				{
					name: "sRGB yellow (D65) to OKlab",
					args: "yellow",
					expect: [0.967983, -0.071369, 0.19857],
				},
				{
					name: "sRGB black (D65) to OKlab",
					args: "black",
					expect: [0.0, 0.0, 0.0],
				},
			],
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
					expect: [1.0, 0.0, null],
				},
				{
					name: "sRGB red (D65) to OKlch",
					args: "red",
					expect: [0.6279553639214311, 0.2576833038053608, 29.23388027962784],
				},
				{
					name: "sRGB lime (D65) to OKlch",
					args: "lime",
					expect: [0.8664396175234368, 0.2948272245426958, 142.4953450414439],
				},
				{
					name: "sRGB blue (D65) to OKlch",
					args: "blue",
					expect: [0.45201371817442365, 0.3132143886344849, 264.0520226163699],
				},
			],
		},
		{
			name: "OKLrab",
			data: {
				toSpace: "oklrab",
			},
			tests: [
				{
					name: "sRGB white (D65) to OKlrab",
					args: "white",
					expect: [1.0000000000000002, -4.996003610813204e-16, 0],
				},
				{
					name: "sRGB red (D65) to OKlrab",
					args: "red",
					expect: [0.5680846563197034, 0.2248630684262744, 0.125846277330585],
				},
				{
					name: "sRGB lime (D65) to OKlrab",
					args: "lime",
					expect: [0.8445289714936317, -0.23388758093655815, 0.1794984451609376],
				},
				{
					name: "sRGB blue (D65) to OKlrab",
					args: "blue",
					expect: [0.3665653391870817, -0.03245697517079771, -0.3115281656775778],
				},
			],
		},
		{
			name: "OKLrCh",
			data: {
				toSpace: "oklrch",
			},
			tests: [
				{
					name: "sRGB white (D65) to OKlrch",
					args: "white",
					expect: [1.0, 0.0, null],
				},
				{
					name: "sRGB red (D65) to OKlrch",
					args: "red",
					expect: [0.5680846563197034, 0.2576833038053608, 29.23388027962784],
				},
				{
					name: "sRGB lime (D65) to OKlrch",
					args: "lime",
					expect: [0.8445289714936317, 0.2948272245426958, 142.4953450414439],
				},
				{
					name: "sRGB blue (D65) to OKlrch",
					args: "blue",
					expect: [0.3665653391870817, 0.3132143886344849, 264.0520226163699],
				},
			],
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
					expect: [1.0, 1.0, 1.0],
				},
				{
					name: "mid grey to linear",
					args: "rgb(50% 50% 50%)",
					expect: [0.21404114, 0.21404114, 0.21404114],
				},
			],
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
					expect: [211.8195, 222.861, 242.7084],
				},
				{
					name: "mid grey (linear 0.5) to XYZ",
					args: "color(acescc 0.4977169 0.4977169 0.4977169)",
					expect: [0.475228, 0.5, 0.544529],
				},
				{
					name: "media black to XYZ",
					args: "color(acescc 0 0 0)",
					expect: [0.001127, 0.001186, 0.001291],
				},
				{
					name: "deepest black to XYZ",
					args: "color(acescc -0.358447, -0.358447, -0.358447)",
					expect: [0, 0, 0],
				},
				{
					name: "ACEScc red to XYZ",
					args: "color(acescc 1.0 0.0 0.0)",
					expect: [145.3586, 59.6545, -1.1981],
				},
				{
					name: "ACEScc green to XYZ",
					args: "color(acescc 0.0 1.0 0.0)",
					expect: [28.5798, 150.2844, 0.306392],
				},
				{
					name: "ACEScc blue to XYZ",
					args: "color(acescc 0.0 0.0 1.0)",
					expect: [37.8833, 12.9243, 243.6027],
				},
			],
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
					expect: [11.42071, -3.24602, -0.722011],
				},
				{
					name: "ACEScc green to P3",
					args: "color(acescc 0.0 1.0 0.0)",
					expect: [-6.096756, 10.318155, -2.713562],
				},
				{
					name: "ACEScc blue to P3",
					args: "color(acescc 0.0 0.0 1.0)",
					expect: [-3.266071, -1.586111, 10.178351],
				},
			],
		},
		{
			name: "CAM16 JMh",
			data: {
				toSpace: "cam16-jmh",
			},
			tests: [
				{
					name: "sRGB white to CAM16 JMh",
					args: "white",
					expect: [100.0, 2.236898, 209.5333],
				},
				{
					name: "sRGB red to CAM16 JMh",
					args: "red",
					expect: [46.0257, 81.25425, 27.39326],
				},
				{
					name: "sRGB lime to CAM16 JMh",
					args: "lime",
					expect: [79.10135, 78.21552, 142.2234],
				},
				{
					name: "sRGB blue to CAM16 JMh",
					args: "blue",
					expect: [25.06626, 62.44153, 282.7545],
				},
				{
					name: "sRGB cyan to CAM16 JMh",
					args: "cyan",
					expect: [85.06114, 42.65358, 196.5924],
				},
				{
					name: "sRGB magenta to CAM16 JMh",
					args: "magenta",
					expect: [54.86332, 77.19869, 334.5684],
				},
				{
					name: "sRGB yellow to CAM16 JMh",
					args: "yellow",
					expect: [94.68236, 54.50008, 111.1473],
				},
				{
					name: "sRGB black to CAM16 JMh",
					args: "black",
					expect: [0.0, 0.0, null],
				},
			],
		},
		{
			name: "HCT",
			data: {
				toSpace: "hct",
			},
			tests: [
				{
					name: "sRGB white to HCT",
					args: "white",
					expect: [209.5429, 2.871589, 100.0],
				},
				{
					name: "sRGB red to HCT",
					args: "red",
					expect: [27.4098, 113.3564, 53.23712],
				},
				{
					name: "sRGB lime to HCT",
					args: "lime",
					expect: [142.1404, 108.4065, 87.73552],
				},
				{
					name: "sRGB blue to HCT",
					args: "blue",
					expect: [282.7622, 87.22804, 32.30087],
				},
				{
					name: "sRGB cyan to HCT",
					args: "cyan",
					expect: [196.5475, 58.96368, 91.11475],
				},
				{
					name: "sRGB magenta to HCT",
					args: "magenta",
					expect: [334.6332, 107.3899, 60.32273],
				},
				{
					name: "sRGB yellow to HCT",
					args: "yellow",
					expect: [111.0456, 75.50438, 97.13856],
				},
				{
					name: "sRGB black to HCT",
					args: "black",
					expect: [null, 0.0, 0.0],
				},
			],
		},
		{
			name: "Luv",
			data: {
				toSpace: "luv",
			},
			tests: [
				{
					name: "sRGB white to Luv",
					args: "white",
					expect: [100.0, 0, 0],
				},
				{
					name: "sRGB red to Luv",
					args: "red",
					expect: [53.23711559542937, 175.0098221628849, 37.76509362555986],
				},
				{
					name: "sRGB lime to Luv",
					args: "lime",
					expect: [87.73551910966002, -83.06711971440055, 107.41811123934258],
				},
				{
					name: "sRGB blue to Luv",
					args: "blue",
					expect: [32.30087290398018, -9.402407214824064, -130.35108850356178],
				},
				{
					name: "sRGB cyan to Luv",
					args: "cyan",
					expect: [91.11475231670536, -70.4643799638778, -15.205397466926968],
				},
				{
					name: "sRGB magenta to Luv",
					args: "magenta",
					expect: [60.322731354551394, 84.05560198975205, -108.69636549176991],
				},
				{
					name: "sRGB yellow to Luv",
					args: "yellow",
					expect: [97.13855934179699, 7.7042191772699375, 106.80811125089548],
				},
				{
					name: "sRGB black to Luv",
					args: "black",
					expect: [0.0, 0.0, 0.0],
				},
				{
					name: "XYZ (none x) to Luv",
					args: "color(xyz-d65 none 0.4 0.5)",
					expect: [69.46953076845696, -178.66105053418175, 10.54825812268007],
				},
				{
					name: "XYZ (none y) to Luv",
					args: "color(xyz-d65 0.3 none 0.5)",
					expect: [0.0, 0.0, 0.0],
				},
				{
					name: "XYZ (none z) to Luv",
					args: "color(xyz-d65 0.3 0.4 none)",
					expect: [69.46953076845696, -6.641260059907392, 93.1177575503318],
				},
				{
					name: "LChuv (sRGB white) to Luv",
					args: "color(--lchuv 100.0 0 0)",
					expect: [100.0, 0.0, 0.0],
				},
				{
					name: "LChuv (sRGB red) to Luv",
					args: "color(--lchuv 53.23711559542937 179.038096923620287 12.1770506300617765)",
					expect: [53.23711559542937, 175.0098221628849, 37.76509362555986],
				},
			],
		},
		{
			name: "Luv to sRGB",
			data: {
				toSpace: "srgb",
			},
			tests: [
				{
					name: "Luv (sRGB white) to sRGB",
					args: "color(--luv 100 0 0)",
					expect: [1.0, 1.0, 1.0],
				},
				{
					name: "Luv (sRGB red) to sRGB",
					args: "color(--luv 53.23711559542937 175.0098221628849 37.76509362555986)",
					expect: [1.0, 0.0, 0.0],
				},
				{
					name: "Luv (sRGB lime) to sRGB",
					args: "color(--luv 87.73551910966002 -83.06711971440055 107.41811123934258)",
					expect: [0.0, 1.0, 0.0],
				},
				{
					name: "Luv (sRGB blue) to sRGB",
					args: "color(--luv 32.30087290398018 -9.402407214824064 -130.35108850356178)",
					expect: [0.0, 0.0, 1.0],
				},
				{
					name: "Luv (sRGB cyan) to sRGB",
					args: "color(--luv 91.11475231670536 -70.4643799638778 -15.205397466926968)",
					expect: [0.0, 1.0, 1.0],
				},
				{
					name: "Luv (sRGB magenta) to sRGB",
					args: "color(--luv 60.322731354551394 84.05560198975205 -108.69636549176991)",
					expect: [1.0, 0.0, 1.0],
				},
				{
					name: "Luv (sRGB yellow) to sRGB",
					args: "color(--luv 97.13855934179699 7.7042191772699375 106.80811125089548)",
					expect: [1.0, 1.0, 0.0],
				},
				{
					name: "Luv (sRGB black) to sRGB",
					args: "color(--luv 0 0 0)",
					expect: [0.0, 0.0, 0.0],
				},
				{
					name: "Luv (none lightness) to sRGB",
					args: "color(--luv none 50 50)",
					expect: [0.0, 0.0, 0.0],
				},
				{
					name: "Luv (none u) to sRGB",
					args: "color(--luv 100% none 0)",
					expect: [1.0, 1.0, 1.0],
				},
				{
					name: "Luv (none v) to sRGB",
					args: "color(--luv 100% 0 none)",
					expect: [1.0, 1.0, 1.0],
				},
			],
		},
		{
			name: "sRGB to LCHuv",
			data: {
				toSpace: "lchuv",
			},
			tests: [
				{
					args: "#771199",
					expect: [30.933250438121703, 76.27303932913182, 290.5839513811392],
				},
				{
					args: "#ffee77",
					expect: [93.33835580058862, 77.48166024357033, 77.51954539527138],
				},
				{
					args: "white",
					expect: [100, 0, null],
				},
				{
					args: "black",
					expect: [0, 0, null],
				},
			],
		},
		{
			name: "HSLuv to sRGB",
			data: {
				toSpace: "srgb",
			},
			tests: [
				{
					name: "HSLuv (sRGB white) to sRGB",
					args: "color(--hsluv 0 0 100)",
					expect: [1.0, 1.0, 1.0],
				},
				{
					name: "HSLuv (sRGB red) to sRGB",
					args: "color(--hsluv 12.1770506300617765 100 53.23711559542933)",
					expect: [1.0, 0.0, 0.0],
				},
				{
					name: "HSLuv (sRGB lime) to sRGB",
					args: "color(--hsluv 127.715012949240474 100 87.7355191096597338)",
					expect: [0.0, 1.0, 0.0],
				},
				{
					name: "HSLuv (sRGB blue) to sRGB",
					args: "color(--hsluv 265.8743202181779 100 32.3008729039800215)",
					expect: [0.0, 0.0, 1.0],
				},
				{
					name: "HSLuv (sRGB cyan) to sRGB",
					args: "color(--hsluv 192.17705063006116 100 91.114752316705065)",
					expect: [0.0, 1.0, 1.0],
				},
				{
					name: "HSLuv (#777777) to sRGB",
					args: "color(--hsluv 0 0 50.0344387925380687)",
					expect: [0.466666666666666674, 0.466666666666666674, 0.466666666666666674],
				},
				{
					name: "HSLuv (sRGB black) to sRGB",
					args: "color(--hsluv 0 0 0)",
					expect: [0.0, 0.0, 0.0],
				},
				{
					name: "HSLuv (#dddddd with none hue) to sRGB",
					args: "color(--hsluv none 0 88.1154369871094)",
					expect: [0.866666666666666696, 0.866666666666666696, 0.866666666666666696],
				},
				{
					name: "HSLuv (none saturation) to sRGB",
					args: "color(--hsluv 80 none 100)",
					expect: [1.0, 1.0, 1.0],
				},
				{
					name: "HSLuv (none lightness) to sRGB",
					args: "color(--hsluv 0 50 none)",
					expect: [0.0, 0.0, 0.0],
				},
			],
		},
		{
			name: "sRGB to HSLuv",
			data: {
				toSpace: "hsluv",
			},
			tests: [
				{
					args: "#771199",
					expect: [290.583951381139741, 94.745562802664864, 30.9332504381216253],
				},
				{
					args: "#ffee77",
					expect: [77.5195453952684659, 100.00000000002693, 93.3383558005883742],
				},
				{
					args: "white",
					expect: [0, 0, 100],
				},
				{
					args: "black",
					expect: [0, 0, 0],
				},
			],
		},
		{
			name: "HPLuv to sRGB",
			data: {
				toSpace: "srgb",
			},
			tests: [
				{
					name: "HPLuv (sRGB white) to sRGB",
					args: "color(--hpluv 0 0 100)",
					expect: [1.0, 1.0, 1.0],
				},
				{
					name: "HPLuv (sRGB red) to sRGB",
					args: "color(--hpluv 12.1770506300617765 426.746789183125202 53.23711559542933)",
					expect: [1.0, 0.0, 0.0],
				},
				{
					name: "HPLuv (sRGB lime) to sRGB",
					args: "color(--hpluv 127.715012949240474 490.145375063702204 87.7355191096597338)",
					expect: [0.0, 1.0, 0.0],
				},
				{
					name: "HPLuv (sRGB blue) to sRGB",
					args: "color(--hpluv 265.8743202181779, 513.41269684428039, 32.3008729039800215)",
					expect: [0.0, 0.0, 1.0],
				},
				{
					name: "HPLuv (sRGB cyan) to sRGB",
					args: "color(--hpluv 192.17705063006116 369.190533917051368 91.114752316705065)",
					expect: [0.0, 1.0, 1.0],
				},
				{
					name: "HPLuv (#777777) to sRGB",
					args: "color(--hpluv 0 0 50.0344387925380687)",
					expect: [0.466666666666666674, 0.466666666666666674, 0.466666666666666674],
				},
				{
					name: "HPLuv (#cc99aa) to sRGB",
					args: "color(--hpluv 349.049331623372325 57.3580941092039609 68.4044417972397838)",
					expect: [0.8, 0.6, 0.66666666666666663],
				},
				{
					name: "HPLuv (sRGB black) to sRGB",
					args: "color(--hpluv 0 0 0)",
					expect: [0.0, 0.0, 0.0],
				},
				{
					name: "HPLuv (#dddddd with none hue) to sRGB",
					args: "color(--hpluv none 0 88.1154369871094)",
					expect: [0.866666666666666696, 0.866666666666666696, 0.866666666666666696],
				},
				{
					name: "HPLuv (none saturation) to sRGB",
					args: "color(--hpluv 80 none 100)",
					expect: [1.0, 1.0, 1.0],
				},
				{
					name: "HPLuv (none lightness) to sRGB",
					args: "color(--hpluv 0 50 none)",
					expect: [0.0, 0.0, 0.0],
				},
			],
		},
		{
			name: "sRGB to HPLuv",
			data: {
				toSpace: "hpluv",
			},
			tests: [
				{
					args: "#cc99aa",
					expect: [349.049331623372325, 57.3580941092039609, 68.4044417972397838],
				},
				{
					args: "cyan",
					expect: [192.17705063006116, 369.190533917051368, 91.114752316705065],
				},
				{
					args: "white",
					expect: [0, 0, 100],
				},
				{
					args: "black",
					expect: [0, 0, 0],
				},
			],
		},
		{
			name: "Okhsl",
			data: {
				toSpace: "okhsl",
			},
			tests: [
				{
					name: "sRGB white to Okhsl",
					args: "white",
					expect: [null, 0.0, 1.0000000000000002],
				},
				{
					name: "sRGB red to Okhsl",
					args: "red",
					expect: [29.233880279627897, 1.0000000995016396, 0.5680846563197034],
				},
				{
					name: "sRGB lime to Okhsl",
					args: "lime",
					expect: [142.4953450414439, 1.0000000000000016, 0.8445289714936317],
				},
				{
					name: "sRGB blue to Okhsl",
					args: "blue",
					expect: [264.05202261636987, 1.0000000005848084, 0.3665653391870817],
				},
				{
					name: "sRGB cyan to Okhsl",
					args: "cyan",
					expect: [194.76895989798186, 1.0000000000000022, 0.8898483085518512],
				},
				{
					name: "sRGB magenta to Okhsl",
					args: "magenta",
					expect: [328.3634151749902, 1, 0.6532987485868166],
				},
				{
					name: "sRGB yellow to Okhsl",
					args: "yellow",
					expect: [109.76923612816614, 1.000000000488464, 0.9627044043394304],
				},
				{
					name: "sRGB black to Okhsl",
					args: "black",
					expect: [null, 0.0, 0.0],
				},
			],
		},
		{
			name: "Okhsv",
			data: {
				toSpace: "okhsv",
			},
			tests: [
				{
					name: "sRGB white to Okhsv",
					args: "white",
					expect: [null, 1.3189507366749435e-15, 1.0000000000000007],
				},
				{
					name: "sRGB red to Okhsv",
					args: "red",
					expect: [29.233880279627897, 1.0000002264814274, 1.0000000000000002],
				},
				{
					name: "sRGB lime to Okhsv",
					args: "lime",
					expect: [142.4953450414439, 0.9999998662472009, 1.0000000000000004],
				},
				{
					name: "sRGB blue to Okhsv",
					args: "blue",
					expect: [264.05202261636987, 1.0000000023007056, 1.0000000000000004],
				},
				{
					name: "sRGB cyan to Okhsv",
					args: "cyan",
					expect: [194.76895989798186, 0.9999996310024463, 1.0000000000000009],
				},
				{
					name: "sRGB magenta to Okhsv",
					args: "magenta",
					expect: [328.3634151749902, 0.999999999954202, 1],
				},
				{
					name: "sRGB yellow to Okhsv",
					args: "yellow",
					expect: [109.76923612816614, 1.000000019514276, 1.0000000000000002],
				},
				{
					name: "sRGB black to Okhsv",
					args: "black",
					expect: [null, 0.0, 0.0],
				},
			],
		},
		{
			name: "Rec2020 to Rec2020 Linear",
			data: {
				toSpace: "rec2020-linear",
			},
			tests: [
				{
					name: "Negative values",
					args: "color(rec2020 -0.07 -0.5 0.2)",
					expect: [-0.001691357, -0.1894645708, 0.021012222],
				},
			],
		},
		{
			name: "Rec2020 Linear to Rec2020",
			data: {
				toSpace: "rec2020",
			},
			tests: [
				{
					name: "Negative values",
					args: "color(--rec2020-linear -0.017 -0.5 0.2)",
					expect: [-0.183099455, -0.749153538, 0.51140209],
				},
			],
		},
		{
			name: "ProPhoto to ProPhoto Linear",
			data: {
				toSpace: "prophoto-linear",
			},
			tests: [
				{
					name: "Negative values",
					args: "color(prophoto-rgb -0.02 -0.5 0.2)",
					expect: [-0.00125, -0.28717, 0.05519],
				},
			],
		},
		{
			name: "ProPhoto Linear to ProPhoto",
			data: {
				toSpace: "prophoto",
			},
			tests: [
				{
					name: "Negative values",
					args: "color(--prophoto-rgb-linear -0.0017 -0.5 0.2)",
					expect: [-0.0272, -0.6804, 0.40896],
				},
			],
		},
		{
			name: "Get coordinates",
			data: {
				slategray: new Color("slategray"),
			},
			tests: [
				{
					name: "color.r",
					run () {
						return this.data.slategray.r;
					},
					expect: 0.4392156862745098,
				},

				{
					name: "color.lch[1]",
					run () {
						return this.data.slategray.lch[1];
					},
					expect: 11.23415,
				},
				{
					name: "color.lch.c",
					run () {
						return this.data.slategray.lch.c;
					},
					expect: 11.23415,
				},
				{
					name: "color.oklch.c",
					run () {
						return this.data.slategray.oklch.c;
					},
					expect: 0.03100055,
				},
				{
					name: "color.jzazbz.Jz",
					run () {
						return this.data.slategray.jzazbz.jz;
					},
					expect: 0.11646942,
				},
				{
					name: "color.jzazbz.Jz",
					run () {
						var color = new Color("jzazbz(0.54 0 0)");
						return color.jzazbz.jz;
					},
					expect: 0.54,
				},
			],
		},
	],
};

export default tests;
