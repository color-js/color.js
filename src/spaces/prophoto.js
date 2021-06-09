import Color from "./srgb.js";

Color.defineSpace({
	inherits: "srgb",
	id: "prophoto",
	name: "ProPhoto",
	cssId: "prophoto-rgb",
	white: Color.whites.D50,
	toLinear(RGB) {
		// Transfer curve is gamma 1.8 with a small linear portion
		const Et2 = 16/512;
		return RGB.map(function (val) {
			if (val < Et2) {
				return val / 16;
			}

			return Math.pow(val, 1.8);
		});
	},
	toGamma(RGB) {
		const Et = 1/512;
		return RGB.map(function (val) {
			if (val >= Et) {
				return Math.pow(val, 1/1.8);
			}

			return 16 * val;
		});
	},
	// convert an array of  prophoto-rgb values to CIE XYZ
	// using  D50 (so no chromatic adaptation needed afterwards)
	// http://www.brucelindbloom.com/index.html?Eqn_RGB_XYZ_Matrix.html
	toXYZ_M: [
		[ 0.7977604896723027,  0.13518583717574031,  0.0313493495815248     ],
		[ 0.2880711282292934,  0.7118432178101014,   0.00008565396060525902 ],
		[ 0.0,                 0.0,                  0.8251046025104601     ]
	],
	fromXYZ_M: [
		[  1.3457989731028281,  -0.25558010007997534,  -0.05110628506753401 ],
		[ -0.5446224939028347,   1.5082327413132781,    0.02053603239147973 ],
		[  0.0,                  0.0,                   1.2119675456389454  ]
	]
});
