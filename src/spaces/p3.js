import RGBColorSpace from "../rgbspace.js";
import P3Linear from "./p3-linear.js";
import sRGB from "./srgb.js";

export default RGBColorSpace.create({
	id: "p3",
	name: "P3",
	base: P3Linear,
	cssId: "display-p3",
	// Gamma correction is the same as sRGB
	// convert an array of display-p3 values to CIE XYZ
	// using  D65 (no chromatic adaptation)
	// http://www.brucelindbloom.com/index.html?Eqn_RGB_XYZ_Matrix.html
	// Functions are the same as sRGB, just with different matrices
	fromBase: sRGB.fromBase,
	toBase: sRGB.toBase,
});
