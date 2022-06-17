import RGBColorSpace from "../rgbspace.js";
import ProPhotoLinear from "./prophoto-linear.js";

const Et = 1/512;
const Et2 = 16/512;

export default RGBColorSpace.create({
	id: "prophoto",
	name: "ProPhoto",
	cssId: "prophoto-rgb",
	base: ProPhotoLinear,
	toBase(RGB) {
		// Transfer curve is gamma 1.8 with a small linear portion
		return RGB.map(v => v < Et2? v / 16 : v ** 1.8);
	},
	fromBase(RGB) {
		return RGB.map(v => v >= Et? v ** (1/1.8) : 16 * v);
	},
});
