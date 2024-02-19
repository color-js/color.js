import RGBColorSpace from "../rgbspace.js";
import P3Linear from "./p3-linear.js";
import sRGB from "./srgb.js";

export default new RGBColorSpace({
	id: "p3",
	cssId: "display-p3",
	name: "P3",
	base: P3Linear,
	// Gamma encoding/decoding is the same as sRGB
	fromBase: sRGB.fromBase,
	toBase: sRGB.toBase,
});
