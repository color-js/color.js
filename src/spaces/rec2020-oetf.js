import RGBColorSpace from "../RGBColorSpace.js";
import REC2020Linear from "./rec2020-linear.js";
// import sRGB from "./srgb.js";

const α = 1.09929682680944;
const β = 0.018053968510807;

export default new RGBColorSpace({
	id: "--rec2020-oetf",
	name: "REC.2020_Scene_Referred",
	base: REC2020Linear,
	referred: "scene",
	// Non-linear transfer function from Rec. ITU-R BT.2020-2 table 4
	toBase (RGB) {
		return RGB.map(function (val) {
			let sign = val < 0 ? -1 : 1;
			let abs = val * sign;

			if (abs < β * 4.5) {
				return val / 4.5;
			}

			return sign * Math.pow((abs + α - 1) / α, 1 / 0.45);
		});
	},
	fromBase (RGB) {
		return RGB.map(function (val) {
			let sign = val < 0 ? -1 : 1;
			let abs = val * sign;

			if (abs >= β) {
				return sign * (α * Math.pow(abs, 0.45) - (α - 1));
			}

			return 4.5 * val;
		});
	},
});
