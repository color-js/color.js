import RGBColorSpace from "../rgbspace.js";
import P3Linear from "./p3-linear.js";
import sRGB from "./srgb.js";

export default RGBColorSpace.create({
	id: "p3",
	name: "P3",
	base: P3Linear,
	cssId: "display-p3",
	// Gamma encoding/decoding is the same as sRGB
	fromBase: sRGB.fromBase,
	toBase: sRGB.toBase,
});
