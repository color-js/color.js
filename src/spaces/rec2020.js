import RGBColorSpace from "../RGBColorSpace.js";
import REC2020Linear from "./rec2020-linear.js";
// import sRGB from "./srgb.js";

export default new RGBColorSpace({
	id: "rec2020",
	name: "REC.2020",
	base: REC2020Linear,
	//  Reference electro-optical transfer function from Rec. ITU-R BT.1886 Annex 1
	//  with b (black lift) = 0 and a (user gain) = 1
	//  defined over the extended range, not clamped
	toBase (RGB) {
		return RGB.map(function (val) {
			let sign = val < 0 ? -1 : 1;
			let abs = val * sign;
			return sign * Math.pow(abs, 2.4);
		});
	},
	fromBase (RGB) {
		return RGB.map(function (val) {
			let sign = val < 0 ? -1 : 1;
			let abs = val * sign;
			return sign * Math.pow(abs, 1 / 2.4);
		});
	},
});
