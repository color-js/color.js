import RGBColorSpace from "../rgbspace.js";
import XYZ_D50 from "./xyz-d50.js";

// convert an array of  prophoto-rgb values to CIE XYZ
// using  D50 (so no chromatic adaptation needed afterwards)
// http://www.brucelindbloom.com/index.html?Eqn_RGB_XYZ_Matrix.html
const toXYZ_M = [
	[ 0.7977604896723027,  0.13518583717574031,  0.0313493495815248     ],
	[ 0.2880711282292934,  0.7118432178101014,   0.00008565396060525902 ],
	[ 0.0,                 0.0,                  0.8251046025104601     ]
];

const fromXYZ_M = [
	[  1.3457989731028281,  -0.25558010007997534,  -0.05110628506753401 ],
	[ -0.5446224939028347,   1.5082327413132781,    0.02053603239147973 ],
	[  0.0,                  0.0,                   1.2119675456389454  ]
];

export default new RGBColorSpace({
	id: "prophoto-linear",
	name: "Linear ProPhoto",
	white: "D50",
	base: XYZ_D50,
	toXYZ_M,
	fromXYZ_M
});
