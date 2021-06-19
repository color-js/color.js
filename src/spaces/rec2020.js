import Color, {util} from "./srgb.js";

/**
 * Rec.2020 UHDTV
 * The transfer function is basically the same as for Rec.709
 * Rec.2100 has a different transfer function
 *
 * @see https://www.itu.int/rec/R-REC-BT.2020/en ITU-R Recommendation BT.2020 
 */
Color.defineSpace({
	inherits: "srgb",
	id: "rec2020",
	name: "REC.2020",
	α: 1.09929682680944,  // will often be assumed to be 1.099 for 10-bit systems and 1.0993 for 12-bit systems
	a: 0.09929682680944,
	β: 0.018053968510807, // will often be assumed to be 0.018 for 10-bit systems and 0.0181 for 12-bit systems
	γ /* > 1 */: 12/5 /* = 2.4 */,
	Γ /* = 1/γ < 1 */: 5/12 /* = 0.41_6 */,
	φ /* = δ */: 4.5 /* = 9/2 */,
	K₀ /* = β*δ = β*φ */: 0.0812428582986315/*...*/,

	toLinear(RGB) {
		const {α, a, φ, γ, K₀} = this;
		return RGB.map(function (val) {
			return (val < K₀) ? val / φ : Math.pow((val + a) / α , γ);
		});
	},
	toGamma(RGB) {
		const {α, a, φ, Γ, β} = this;
		return RGB.map(function (val) {
			return (val <= β) ? val * φ : Math.pow(val, Γ) * α - a;
		});
	},
	// convert an array of linear-light rec2020 values to CIE XYZ
	// using  D65 (no chromatic adaptation)
	// http://www.brucelindbloom.com/index.html?Eqn_RGB_XYZ_Matrix.html
	// 0 is actually calculated as  4.994106574466076e-17
	toXYZ_M: [
		[ 0.636958048301291400,  0.144616903586208320,  0.16888097516417210 ],
		[ 0.262700212011267100,  0.677998071518870800,  0.05930171646986196 ],
		[ 0.000000000000000000,  0.028072693049087428,  1.06098505771079100 ]
	],
	fromXYZ_M: [
		[ 1.716651187971267400, -0.355670783776392330, -0.25336628137365974 ],
		[-0.666684351832489200,  1.616481236634939500,  0.01576854581391113 ],
		[ 0.017639857445310783, -0.042770613257808524,  0.94210312123547380 ]
	]
});

export default Color;
export {util};
