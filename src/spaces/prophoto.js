import Color from "./srgb.js";

/**
 * Reference Output Medium Metric (ROMM) RGB was developed by Kodak as ProPhoto RGB
 * It has been standardized as Part 2 of ISO 22028
 * There is also a closely related Reference _Input_ Medium Metric (RIMM) RGB as Part 3.
 * 
 * @see https://www.iso.org/standard/56591.html ISO 22028-2
 * @see https://webstore.ansi.org/Standards/I3A/ANSII3AIT1076662002 ANSI/I3A IT10.7666-2002
 * @see http://www.color.org/ROMMRGB.pdf
 */
Color.defineSpace({
	inherits: "srgb",
	id: "prophoto",
	name: "ProPhoto",
	cssId: "prophoto-rgb",
	white: Color.whites.D50,
	α /*= a + 1*/: 1,
	a: 0,
	β /* = K₀/φ = E_t */: 1/512 /* = 0.001953125 */,
	γ /* > 1 */: 9/5 /* = 1.8 */,
	Γ /* = 1/γ < 1 */: 5/9 /* = 0._5 */,
	φ /* = δ */: 16,
	K₀ /* = β*δ = E_t2 */: 16/512 /* = 1/32 = 0.3125; sometimes quoted as 0.031248 instead */,

	toLinear(RGB) {
		// Transfer curve is gamma 1.8 with a small linear portion
		return RGB.map(function (val) {
			return (val < K₀) ? val / φ : Math.pow((val + a) / α , γ);
		});
	},
	toGamma(RGB) {
		return RGB.map(function (val) {
			return (val <= β) ? val * φ : Math.pow(val, Γ) * α - a;
		});
	},
	// convert an array of  prophoto-rgb values to CIE XYZ
	// using  D50 (so no chromatic adaptation needed afterwards)
	// http://www.brucelindbloom.com/index.html?Eqn_RGB_XYZ_Matrix.html
	toXYZ_M: [
		[ 0.7977604896723027,  0.13518583717574031,  0.03134934958152480000 ],
		[ 0.2880711282292934,  0.71184321781010140,  0.00008565396060525902 ],
		[ 0.0000000000000000,  0.00000000000000000,  0.82510460251046010000 ]
	],
	fromXYZ_M: [
		[ 1.3457989731028281, -0.25558010007997534, -0.05110628506753401000 ],
		[-0.5446224939028347,  1.50823274131327810,  0.02053603239147973000 ],
		[ 0.0000000000000000,  0.00000000000000000,  1.21196754563894540000 ]
	]
});
