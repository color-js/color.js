import RGBColorSpace from "../rgbspace.js";
import REC2020Linear from "./rec2020-linear.js";
// import sRGB from "./srgb.js";

const α = 1.09929682680944;
const β = 0.018053968510807;

export default new RGBColorSpace({
	id: "rec2020",
	name: "REC.2020",
	base: REC2020Linear,
	// Non-linear transfer function from Rec. ITU-R BT.2020-2 table 4
	toBase (RGB) {
		return RGB.map(function (val) {
			if (val < β * 4.5) {
				return val / 4.5;
			}

			return Math.pow((val + α - 1) / α, 1 / 0.45);
		});
	},
	fromBase (RGB) {
		return RGB.map(function (val) {
			if (val >= β) {
				return α * Math.pow(val, 0.45) - (α - 1);
			}

			return 4.5 * val;
		});
	},
});
