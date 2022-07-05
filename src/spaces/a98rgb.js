import RGBColorSpace from "../rgbspace.js";
import A98Linear from "./a98rgb-linear.js";

export default new RGBColorSpace({
	id: "a98rgb",
	name: "Adobe® 98 RGB compatible",
	base: A98Linear,
	toBase: RGB => RGB.map(val => Math.pow(Math.abs(val), 563 / 256) * Math.sign(val)),
	fromBase: RGB => RGB.map(val => Math.pow(Math.abs(val), 256 / 563) * Math.sign(val)),
	formats: {
		color: {
			id: "a98-rgb"
		}
	},
});
