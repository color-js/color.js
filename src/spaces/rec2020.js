import Color, {util} from "./srgb.js";

Color.defineSpace({
	inherits: "srgb",
	id: "rec2020",
	name: "REC.2020",
	α: 1.09929682680944,
	β: 0.018053968510807,
	toLinear(RGB) {
		const {α, β} = this;

		return RGB.map(function (val) {
			if (val < β * 4.5 ) {
				return val / 4.5;
			}

			return Math.pow((val + α -1 ) / α, 2.4);
		});
	},
	toGamma(RGB) {
		const {α, β} = this;

		return RGB.map(function (val) {
			if (val > β ) {
				return α * Math.pow(val, 1/2.4) - (α - 1);
			}

			return 4.5 * val;
		});
	},
	// convert an array of linear-light rec2020 values to CIE XYZ
	// using  D65 (no chromatic adaptation)
	// http://www.brucelindbloom.com/index.html?Eqn_RGB_XYZ_Matrix.html
	// 0 is actually calculated as  4.994106574466076e-17
	toXYZ_M: [
		[0.6369580483012914, 0.14461690358620832,  0.1688809751641721],
		[0.2627002120112671, 0.6779980715188708,   0.05930171646986196],
		[0.000000000000000,  0.028072693049087428, 1.060985057710791]
	],
	fromXYZ_M: [
		[1.7166511879712674,   -0.35567078377639233, -0.25336628137365974],
		[-0.6666843518324892,   1.6164812366349395,   0.01576854581391113],
		[0.017639857445310783, -0.042770613257808524, 0.9421031212354738]
	]
});

export default Color;
export {util};
