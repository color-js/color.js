import RGBColorSpace from "../rgbspace.js";
import REC2020Linear from "./rec2020-linear.js";

// FIXME see https://github.com/LeaVerou/color.js/issues/190

const a = 0.17883277;
const b = 0.28466892; // 1 - (4 * a)
const c = 0.55991073; // 0.5 - a * Math.log(4 *a)

const scale = 3.7743;	// Place 18% grey at HLG 0.38, so media white at 0.75

export default new RGBColorSpace({
	id: "rec2100hlg",
	cssId: "rec2100-hlg",
	name: "REC.2100-HLG",
	referred: "scene",

	base: REC2020Linear,
	toBase (RGB) {
		// given HLG encoded component in range [0, 1]
		// return media-white relative linear-light
		return RGB.map(function (val) {
			// first the HLG EOTF
			// ITU-R BT.2390-10 p.30 section
			// 6.3 The hybrid log-gamma electro-optical transfer function (EOTF)
			// Then scale by 3 so media white is 1.0
			if (val <= 0.5) {
				return (val ** 2) / 3 * scale;
			}
			return ((Math.exp((val - c) / a) + b) / 12) * scale;
		});
	},
	fromBase (RGB) {
		// given media-white relative linear-light
		// where diffuse white is 1.0,
		// return HLG encoded component in range [0, 1]
		return RGB.map(function (val) {
			// first scale to put linear-light media white at 1/3
			val /= scale;
			// now the HLG OETF
			// ITU-R BT.2390-10 p.23
			// 6.1 The hybrid log-gamma opto-electronic transfer function (OETF)
			if (val <= 1 / 12) {
				return Math.sqrt(3 * val);
			}
			return a * Math.log(12 * val - b) + c;
		});
	},
});
