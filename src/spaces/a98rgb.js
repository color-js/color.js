import RGBColorSpace from "../rgbspace.js";
import A98Linear from "./a98rgb-linear.js";

export default RGBColorSpace.create({
	id: "a98rgb",
	name: "Adobe 98 RGB compatible",
	cssId: "a98-rgb",
	base: A98Linear,
	toBase: RGB => RGB.map(val => Math.pow(Math.abs(val), 563 / 256) * Math.sign(val)),
	fromBase: RGB => RGB.map(val => Math.pow(Math.abs(val), 256 / 563) * Math.sign(val)),
});
