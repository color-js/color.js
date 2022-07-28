import RGBColorSpace from "../rgbspace.js";
import REC2020Linear from "./rec2020-linear.js";

// FIXME see https://github.com/LeaVerou/color.js/issues/190

const a = 0.17883277;
const b = 0.28466892; // 1 - (4 * a)
const c = 0.55991073; // 0.5 - a * Math.log(4 *a)

export default new RGBColorSpace({
	id: "rec2100hlg",
	cssid: "rec2100-hlg",
	name: "REC.2100-HLG",
	referred: "scene",

	base: REC2020Linear,
	toBase (RGB) {
		// given HLG encoded component in range [0, 1]
		// return media-white relative linear-light
		return RGB.map(function (val) {
			if (val <= 1/12) {
				return Math.sqrt( 3 * val);
			}
			return a * Math.log(12 * val - b) + c;
		});
	},
	fromBase (RGB) {
		// given media-white relative linear-light
		// return HLG encoded component in range [0, 1]
		// per ITU Rec BT.2390
		return RGB.map(function (val) {
			if (val <= 0.5) {
				return (val ** 2) / 3;
			}
			return Math.exp(((val - c) / a) + b) / 12;
		});
	},
	formats: {
		color: {
			id: "rec2100-hlg"
		},
	},
});
