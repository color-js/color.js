import Color from "./srgb.js";

/**
 * The Digital Cinema Initiative's DCI P3 uses a 6300-K reference whitepoint, 
 * unlike Apple's Display P3 which uses the more common D65
 *
 * @see https://doi.org/10.5594%2FSMPTE.EG432-1.2010 SMPTE EG 432-1 
 * @see https://doi.org/10.5594%2FSMPTE.RP431-2.2011 SMPTE RP 431-2
 */
Color.defineSpace({
	inherits: "srgb",
	id: "dci-p3",
	name: "DCI P3",
	cssId: "dci-p3",
	white: Color.whites.Theater,
	// Gamma correction is the same as sRGB
	// convert an array of dci-p3 values to CIE XYZ
	// using Theater {0.3140, 0.3510} instead of D65 = {0.3127, 0.3290} (no chromatic adaptation)
	// http://www.brucelindbloom.com/index.html?Eqn_RGB_XYZ_Matrix.html
	// Functions are the same as sRGB, just with different matrices
	toXYZ_M: [
		[ 0.48657094864821620,  0.26566769316909306,  0.198217285234362500 ],
		[ 0.22897456406974880,  0.69173852183650640,  0.079286914093745000 ],
		[ 0.00000000000000000,  0.04511338185890264,  1.043944368900976000 ]
	],
	fromXYZ_M: [
		[ 2.49349691194142500, -0.93138361791912390, -0.402710784450716840 ],
		[-0.82948896956157470,  1.76266406031834630,  0.023624685841943577 ],
		[ 0.03584583024378447, -0.07617238926804182,  0.956884524007687200 ]
	]
});
